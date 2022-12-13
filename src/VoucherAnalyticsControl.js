import React, { Component } from 'react'
import {
  doc,
  getDoc,
} from 'firebase/firestore'
import { CSVLink, CSVDownload } from 'react-csv'

export class VoucherAnalyticsControl extends Component {
  state = {
    storage: null,
    dateStart: null,
    dateEnd: null,
    vouchers: null,
    getDataButton: true,
    key: null,
  }

  constructor(props) {
    super(props)
    getDoc(doc(window.firebase.db, 'auth', 'voucherService'))
      .then(snapshot => {
        const { key } = snapshot.data()
        this.setState({ key })
      })

    this.state = {
      ...this.state,
      ...window.firebase
    }
  }
  handleDownload(ev) {
    this.setState({ getDataButton: false })

    this.state.dateStart = this.props.entry.getIn(['data', 'dateStart'])
    this.state.dateEnd = this.props.entry.getIn(['data', 'dateEnd'])

    let url = `https://europe-west3-thewalks-8f658.cloudfunctions.net/voucherAnalytics?date_start=${this.state.dateStart}&date_end=${this.state.dateEnd}&key=${this.state.key}`
    
    fetch(url)
      .then(response => {
        if (!response.ok) {
          throw Error(response.statusText)
        }
        return response.json()
      })
      .then(data => this.setState({ vouchers: data.used_vouchers }))
      .then(() => this.setState({ getDataButton: true }))
      .catch(error => {
        console.log(error)
      })
  }
  

  render() {
    return (
      <div style={{ marginTop: '1rem' }}>
      { !this.props.entry.getIn(['data', 'dateStart']) ? 
        ( 
          <div>SELECT DATES + PUBLISH</div> 
        ) : (
          Array.isArray(this.state.vouchers) ? 
          ( 
            <CSVLink data={this.state.vouchers} separator={";"}>DOWNLOAD CSV DATA</CSVLink>
          ) : ( 
            <button 
              onClick={() => this.handleDownload()}
              disabled={!this.state.getDataButton}>GET DATA</button> 
          )
        )
      }
      
      </div>
    )
  }
}
