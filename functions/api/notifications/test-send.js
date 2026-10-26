export async function onRequestPost(context) {
  try {
    const body = await context.request.json().catch(() => ({}));
    const name = body.name || 'أخي / أختي';

    return new Response(JSON.stringify({
      status: 'success',
      message: `تم استقبال طلب الإشعار التجريبي لـ ${name} بنجاح! 🔔`
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  } catch (err) {
    return new Response(JSON.stringify({
      status: 'error',
      message: err.message || 'خطأ في معالجة طلب الإشعار التجريبي'
    }), {
      status: 400,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
}
