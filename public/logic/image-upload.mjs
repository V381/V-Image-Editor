export function uploadImage() {
  const uploadButton = document.querySelector('.upload-button');
  const uploadInput = document.querySelector('.upload-input');
  const flipButton = document.querySelector('.flip-button');
  const rotateButton = document.querySelector('.rotate-button');
  const resizeButton = document.querySelector('.resize-button');
  const image = document.querySelector('.uploaded-image');
  const saveButton = document.querySelector('.save-button');
  let isFlipped = false;
  let rotation = 0;
  let imageData = null;

  uploadButton.addEventListener('click', () => {
    uploadInput.click();
  });

  flipButton.addEventListener('click', () => {
    flipImage();
  });

  rotateButton.addEventListener('click', () => {
    rotateImage();
  });

  resizeButton.addEventListener('click', () => {
    resizeImage();
  });

  uploadInput.addEventListener('change', handleImageUpload);

  function handleImageUpload() {
    const file = uploadInput.files[0];

    if (file) {
      const formData = new FormData();
      formData.append('image', file);

      fetch('/upload', {
        method: 'POST',
        body: formData
      })
        .then(response => response.blob())
        .then(blob => {
          imageData = blob;
          const imageUrl = URL.createObjectURL(blob);
          image.src = imageUrl;
          isFlipped = false;
          rotation = 0;
          applyTransformations();
        })
        .catch(error => {
          console.error('Error:', error);
        });
    }
  }

  function flipImage() {
    if (image.src) {
      isFlipped = !isFlipped;
      applyTransformations();
    }
  }

  function rotateImage() {
    if (image.src) {
      rotation += 90;
      applyTransformations();
    }
  }

  function resizeImage() {
    if (image.src) {
      const newWidth = prompt('Enter the new width:');
      const newHeight = prompt('Enter the new height:');

      if (newWidth && newHeight) {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');

        const img = new Image();
        img.onload = () => {
          canvas.width = newWidth;
          canvas.height = newHeight;
          context.drawImage(img, 0, 0, newWidth, newHeight);

          const resizedImageData = canvas.toDataURL('image/png');
          const blob = dataURLToBlob(resizedImageData);

          image.src = URL.createObjectURL(blob);
          imageData = blob;
          applyTransformations();
        };
        img.src = image.src;
      }
    }
  }

  saveButton.addEventListener('click', saveTransformedImage);

  async function saveTransformedImage() {
    if (imageData) {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
  
      const img = new Image();
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        context.drawImage(img, 0, 0);
  
        if (isFlipped || rotation !== 0) {
          applyTransformationsToCanvas(canvas);
        }
  
        const editedImageData = canvas.toDataURL('image/png');
        const downloadLink = document.createElement('a');
        downloadLink.href = editedImageData;
        downloadLink.download = 'edited_image.png';
        downloadLink.click();
      };
      img.src = URL.createObjectURL(imageData);
    }
  }
  
  function applyTransformationsToCanvas(canvas) {
    const context = canvas.getContext('2d');
    const tempCanvas = document.createElement('canvas');
    const tempContext = tempCanvas.getContext('2d');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    tempContext.drawImage(canvas, 0, 0);
  
    const maxDimension = Math.max(canvas.width, canvas.height);
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const rotateAngle = (rotation * Math.PI) / 180;
  
    canvas.width = maxDimension;
    canvas.height = maxDimension;
  
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.save();
    context.translate(centerX, centerY);
    context.rotate(rotateAngle);
    context.scale(isFlipped ? -1 : 1, 1);
  
    // Bicubic interpolation
    const resizedCanvas = document.createElement('canvas');
    const resizedContext = resizedCanvas.getContext('2d');
    resizedCanvas.width = canvas.width;
    resizedCanvas.height = canvas.height;
    resizedContext.drawImage(tempCanvas, 0, 0, tempCanvas.width, tempCanvas.height, 0, 0, resizedCanvas.width, resizedCanvas.height);
  
    context.drawImage(
      resizedCanvas,
      -canvas.width / 2,
      -canvas.height / 2,
      canvas.width,
      canvas.height
    );
  
    context.restore();
  }
  
  function applyTransformations() {
    let transform = '';

    if (isFlipped) {
      transform += 'scaleX(-1) ';
    }

    if (rotation !== 0) {
      transform += `rotate(${rotation}deg)`;
    }

    image.style.transform = transform;
    image.style.transition = 'transform 0.3s ease';
  }

  function dataURLToBlob(dataURL) {
    const byteString = atob(dataURL.split(',')[1]);
    const mimeString = dataURL.split(',')[0].split(':')[1].split(';')[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);

    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }

    return new Blob([ab], { type: mimeString });
  }
}
