import React, { Component } from 'react'
import VirtualList from 'react-tiny-virtual-list'
import {
  getFirestore,
  query,
  orderBy,
  collection,
  doc,
  getDoc,
  onSnapshot,
  deleteDoc
} from 'firebase/firestore'
import { ref, deleteObject } from 'firebase/storage'


export class UserImagesControl extends Component {
  state = {
    db: null,
    storage: null,
    walkId: null,
    markers: []
  }

  constructor(props) {
    super(props)
    const walkId = props.value || window.location.href.split('_')[1]
    if (walkId) {
      this.state = {
        ...this.state,
        ...window.firebase,
        walkId
      }
      const q = query(collection(this.state.db, walkId), orderBy('date', 'desc'))
      onSnapshot(q, markersSnapshot => {
        const markers = []
        markersSnapshot.docs.forEach(markerRef => {
          markers.push({id: markerRef.id, ...markerRef.data()})
        }) 
        this.setState(state => ({...state, markers}))
      })
    }
  }

  deleteMarker({id}) {
    const markerReference = doc(this.state.db, this.state.walkId, id)
    getDoc(markerReference).then(markerSnap => {
      const marker = markerSnap.data()
      if (marker.storagePath) {
        const fileRef = ref(
          this.state.storage,
          marker.storagePath
        )
        deleteObject(fileRef)
      }
      deleteDoc(markerReference)
    })
  }

  renderImage({marker, style}) {
    return (
      <div key={marker.id} style={{width: '300px', ...style}}>
        <button onClick={ev => confirm('Delete?') && this.deleteMarker(marker)}>Delete</button>
        <a style={{display: 'block', margin: '0 10px'}} href={marker.image.uri} target='_blank'>
          <img style={{maxHeight: 600, width: '100%'}} src={`${marker.image.uri}?w=300`}/>
        </a>
      </div>
    )
  }

  render() {
    return this.state.markers.length ? (
      <VirtualList
        scrollDirection='horizontal'
        width='100%'
        height={630}
        itemCount={this.state.markers.length}
        itemSize={320}
        renderItem={({index, style}) => (
          this.renderImage({marker: this.state.markers[index], style})
        )}
      />
    ) : null
  }
}
