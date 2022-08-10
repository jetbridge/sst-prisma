export const responder = (callback: any) => ({
  success: (response: any) => {
    console.info("Success response")
    // console.debug("Response was: ", response)
    callback(null, {
      statusCode: 200,
      body: JSON.stringify(response),
      headers: {
        "Content-Type": "application/json",
      },
    })
  },
  error: (err: any) => {
    console.error("Error response: ", err.message || err)
    callback(null, {
      statusCode: 400,
      body: JSON.stringify(err.message),
      headers: {
        "Content-Type": "application/json",
      },
    })
  },
  redirect: (url: any) => {
    console.info("Redirect response")
    console.debug("Redirect response to %s", url, {})
    callback(null, {
      statusCode: 302,
      headers: {
        Location: url,
      },
    })
  },
})
