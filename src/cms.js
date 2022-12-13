import { UserImagesControl } from './UserImages'
import { FirebaseFileControl } from './FirebaseFile'
import { VouchersControl } from './VouchersControl'
import { VoucherAnalyticsControl } from './VoucherAnalyticsControl'

import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'


const getJSON = (url, callback) => {
  var xhr = new XMLHttpRequest()
  xhr.open('GET', url, true)
  xhr.setRequestHeader('Authorization', `Bearer ${window.netlifyIdentity.currentUser()?.token.access_token}`)
  xhr.responseType = 'json'
  xhr.onload = () => {
    var status = xhr.status
    if (status === 200) {
      callback(null, xhr.response)
    } else {
      callback(status, xhr.response)
    }
  }
  xhr.onerror = console.error
  xhr.send()
}

getJSON(window.location.origin + '/.netlify/functions/firebaseAuth',
  (error, firebaseConfig) => {
    initializeApp(firebaseConfig)
    const storage = getStorage()
    const db = getFirestore()
    window.firebase = {
      storage,
      db,
      firebaseConfig,
    }
    CMS.registerWidget('userImages', UserImagesControl)
    CMS.registerWidget('firebaseFile', FirebaseFileControl)
    CMS.registerWidget('voucherAnalytics', VoucherAnalyticsControl)
    CMS.registerWidget('vouchers', VouchersControl)
  }
)
