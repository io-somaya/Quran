export async function onRequestGet() {
  return new Response(JSON.stringify({
    status: 'success',
    publicKey: 'BHk4n3Fpl2PyCT5CvxsGRr4Y05-QsmvowxxbbjmZHwnU6iF587CohLpGMNM89tc8poXh9mUvfwpNqrm5fmIIBEk'
  }), {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    }
  });
}
