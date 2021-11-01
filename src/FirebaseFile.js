import React, { Component } from 'react'
import { ref, getDownloadURL, uploadBytes } from 'firebase/storage'


export class FirebaseFileControl extends Component {
  state = {
    root: null,
    files: [],
    uploading: null,
    value: null
  }

  constructor(props) {
    super(props)
    const branch = props.config.backend.branch
    const slug = props.entry.get('slug')
    const root = `mp3/${branch}/${slug}/`
    this.state = {
      ...this.state,
      branch,
      slug,
      root,
      value: props.value || ''
    }
  }

  handleUpload(ev) {
    const file = ev.target.files[0]
    const fileRef = ref(window.firebase.storage, this.state.root + file.name)
    this.setState(state => ({...state, uploading: file.name}))
    uploadBytes(fileRef, file).then(({ref}) => {
      getDownloadURL(ref).then(value => {
	this.props.onChange(value)
	this.setState(state => ({
	  ...state,
	  value,
	  uploading: null
	}))
      })
    })
  }

  render() {
    return (
      <div style={{border: '2px solid rgb(223, 223, 223)', padding: '1rem'}}>
	{typeof this.state.value == 'string' ? (
	  <div>
	    <div>
	      <audio key={this.state.value} controls>
		<source src={this.state.value} type="audio/mpeg"/>
	      </audio>
	    </div>
	    <div>
	      <h3>{this.state.value ? 'Choose a different file' : 'Upload'}</h3>
	      <input
		type="file"
		name="filename"
		accept="audio/mpeg"
		onChange={ev => this.handleUpload(ev)}
	      />
	    </div>
	    {!!this.state.uploading ? (
	      <div>
		<b>Uploading: {this.state.uploading}</b>
	      </div>
	    ) : null}
	  </div>
	) : (
	  this.state.value.map(walkId => (
	    <div key={walkId}>
	      <a style={{cursor: 'pointer'}} onClick={() => window.open([...window.location.href.split('/').slice(0, -1), walkId].join('/'))}>{walkId}</a>
	    </div>
	  ))
	)}
      </div>
    )
  }
}
