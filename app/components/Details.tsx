import React from 'react'

function Details({feedback}: {feedback: Feedback | null}) {
  return (
    <div>Details
        {JSON.stringify(feedback)}
    </div>
  )
}

export default Details  