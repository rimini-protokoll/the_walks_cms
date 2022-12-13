import React, { Component } from 'react'
import {
  query,
  where,
  collection,
  onSnapshot,
  doc,
  getDoc,
} from 'firebase/firestore'


export class VouchersControl extends Component {
  state = {
    storage: null,
    guestVenue: null,
    allVouchers: [],
    unusedVouchers: [],
    createNumVouchers: 1,
    loading: false,
  }

  constructor(props) {
    super(props)
    const guestVenue = this.props.entry.getIn(['data', 'guestVenue'])
    if (guestVenue) {
      this.state = {
        ...this.state,
        ...window.firebase,
        guestVenue,
      }
      getDoc(doc(this.state.db, 'auth', 'voucherService'))
        .then(snapshot => {
          const { key } = snapshot.data()
          this.setState({ key })
        })
      const q = query(collection(this.state.db, 'vouchers'), where('guest_venue', '==', guestVenue))
      onSnapshot(q, vouchersSnapshot => {
        const numTotalVouchers = vouchersSnapshot.docs.length
        const allVouchers = []
        const unusedVouchers = []
        vouchersSnapshot.docs.forEach(voucherRef => {
          const voucher = {voucherId: voucherRef.id, ...voucherRef.data()}
          allVouchers.push(voucher)
          if (voucher.used !== true) {
            unusedVouchers.push(voucher)
          }
        }) 
        const text = unusedVouchers.map(({ voucherId }) => voucherId).join('\n')
        const downloadLink = window.URL.createObjectURL(new Blob([text], { type: 'text/plain' }))
        this.setState(state => ({...state, unusedVouchers, downloadLink, numTotalVouchers}))
      })
    }
  }

  renderVoucher({voucher, style}) {
    return (
      <div key={voucher.voucherId} style={{...style, gridAutoFlow: 'row'}}>
        <div style={{display: 'block', margin: '0 10px'}}>
          {voucher.voucherId}
        </div>
      </div>
    )
  }

  createVouchers() {
    this.setState({ loading: true })
    let url = `https://europe-west3-thewalks-8f658.cloudfunctions.net/createVouchers`
    url += `?guestVenue=${this.state.guestVenue}&numVouchers=${this.state.createNumVouchers}&key=${this.state.key}`
    const req = new XMLHttpRequest()
    fetch(url).then(() => {
      this.setState({ loading: false })
    }).catch(function(error) {
      console.log(error)
    })
  }

  render() {
    return (
      <div>
        {this.state.loading ? (
          <h1>Loading...</h1>
        ) : (
          <div>
            <div>
              Number of unused vouchers: {this.state.unusedVouchers.length}/{this.state.numTotalVouchers}
            </div>
            <div>
              Create vouchers:
              <input
                type="number"
                min="1"
                value={this.state.createNumVouchers}
                onChange={({ target }) => this.setState({ createNumVouchers: target.value })}
                style={{ border: '1px solid'}}
              />
              <button onClick={() => this.createVouchers()}>Submit</button>
            </div>
            <div>
              <a
                download={`${this.state.guestVenue}_vouchers.txt`}
                href={this.state.downloadLink}
                style={{ textDecoration: 'underline' }}
                target="_blank"
              >
                👉 Download unused vouchers
              </a>
            </div>
          </div>
        )}
        Unused vouchers:
        <div
          width='100%'
          style={{ maxHeight: 300, overflow: 'scroll', padding: '10px', border: 'solid 1px'}}
        >
          {this.state.unusedVouchers.map(voucher => {
            return this.renderVoucher({voucher})
          })}
        </div>
      </div>
    )
  }
}
