const fs = require('fs');
async function test() {
    const formData = new FormData();
    const pixel = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');
    const blob = new Blob([pixel], { type: 'image/gif' });
    formData.append('file', blob, 'test.gif');
    formData.append('upload_preset', 'ml_default');
    
    const cloudName = 'dp2shlxl3';
    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: 'POST',
        body: formData
    });
    console.log(res.status);
    console.log(await res.json());
}
test();
