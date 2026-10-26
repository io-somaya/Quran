export async function onRequestPost(context) {
  try {
    const data = await context.request.json().catch(() => ({}));
    if (!data.name || !data.phone || !data.email) {
      return new Response(JSON.stringify({
        status: 'error',
        message: 'الرجاء إدخال كافة البيانات الإلزامية'
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    const user = {
      id: 'sub_' + Date.now(),
      name: data.name.trim(),
      phone: data.phone.trim(),
      email: data.email.trim(),
      reminderTime: data.reminderTime || '06:00',
      planId: data.planId || 'furqan',
      currentPage: Number(data.currentPage) || 1
    };

    return new Response(JSON.stringify({
      status: 'success',
      message: `تم إنشاء حسابك وتفعيل الإشعارات بنجاح يا ${user.name}! 🌸`,
      user
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  } catch (err) {
    return new Response(JSON.stringify({
      status: 'error',
      message: err.message || 'خطأ في حفظ الحساب'
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
