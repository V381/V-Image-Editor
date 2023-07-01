export function uploadImage() {
    const uploadButton = document.querySelector('.upload-button');
    const uploadInput = document.querySelector('.upload-input');
    const flipButton = document.querySelector('.flip-button');
    const rotateButton = document.querySelector('.rotate-button');
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
  
    saveButton.addEventListener('click', saveTransformedImage);
  
    async function saveTransformedImage() {
      if (imageData) {
        let transformedImageData = imageData;
        if (isFlipped || rotation !== 0) {
          transformedImageData = await applyTransformationsToImageData(imageData);
        }
        const downloadLink = document.createElement('a');
        downloadLink.href = URL.createObjectURL(transformedImageData);
        downloadLink.download = 'transformed_image.png';
        downloadLink.click();
      }
    }
  
    async function applyTransformationsToImageData(imageData) {
      let transformedData = imageData;
      if (isFlipped || rotation !== 0) {
        transformedData = await flipAndRotateImageData(imageData);
      }
      return transformedData;
    }
  
    function flipAndRotateImageData(imageData) {
      return new Promise(resolve => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
  
            let canvasWidth = img.width;
            let canvasHeight = img.height;
            let offsetX = 0;
            let offsetY = 0;
  
            if (rotation === 90 || rotation === 270) {
              canvasWidth = img.height;
              canvasHeight = img.width;
              offsetX = (canvasWidth - img.width) / 2;
              offsetY = (canvasHeight - img.height) / 2;
            }
  
            canvas.width = canvasWidth;
            canvas.height = canvasHeight;
  
            context.save();
            context.translate(canvas.width / 2, canvas.height / 2);
            context.rotate((rotation * Math.PI) / 180);
            context.scale(isFlipped ? -1 : 1, 1);
            context.drawImage(img, -img.width / 2, -img.height / 2);
            context.restore();
  
            canvas.toBlob(resolve, 'image/png');
          };
          img.src = reader.result;
        };
        reader.readAsDataURL(imageData);
      });
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
  }
  