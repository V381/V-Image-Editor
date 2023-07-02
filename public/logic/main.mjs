class ImageEditor {
    constructor() {
      this.uploadButton = document.querySelector('.upload-button');
      this.uploadInput = document.querySelector('.upload-input');
      this.flipButton = document.querySelector('.flip-button');
      this.rotateButton = document.querySelector('.rotate-button');
      this.resizeButton = document.querySelector('.resize-button');
      this.image = document.querySelector('.uploaded-image');
      this.saveButton = document.querySelector('.save-button');
      this.isFlipped = false;
      this.rotation = 0;
      this.imageData = null;
      this.observers = [];
  
      this.uploadButton.addEventListener('click', () => {
        this.uploadInput.click();
      });
  
      this.flipButton.addEventListener('click', () => {
        this.flipImage();
      });
  
      this.rotateButton.addEventListener('click', () => {
        this.rotateImage();
      });
  
      this.resizeButton.addEventListener('click', () => {
        this.resizeImage();
      });
  
      this.uploadInput.addEventListener('change', () => {
        this.handleImageUpload();
      });
  
      this.saveButton.addEventListener('click', () => {
        this.saveTransformedImage();
      });
    }
  
    subscribe(observer) {
      this.observers.push(observer);
    }
  
    unsubscribe(observer) {
      this.observers = this.observers.filter((obs) => obs !== observer);
    }
  
    notifyObservers() {
      this.observers.forEach((observer) => observer.update());
    }
  
    handleImageUpload() {
      const file = this.uploadInput.files[0];
  
      if (file) {
        const formData = new FormData();
        formData.append('image', file);
  
        fetch('/upload', {
          method: 'POST',
          body: formData
        })
          .then((response) => response.blob())
          .then((blob) => {
            this.imageData = blob;
            const imageUrl = URL.createObjectURL(blob);
            this.image.src = imageUrl;
            this.isFlipped = false;
            this.rotation = 0;
            this.applyTransformations();
            this.notifyObservers();
          })
          .catch((error) => {
            console.error('Error:', error);
          });
      }
    }
  
    flipImage() {
      if (this.image.src) {
        this.isFlipped = !this.isFlipped;
        this.applyTransformations();
        this.notifyObservers();
      }
    }
  
    rotateImage() {
      if (this.image.src) {
        this.rotation += 90;
        this.applyTransformations();
        this.notifyObservers();
      }
    }
  
    resizeImage() {
        if (this.image.src) {
          const newWidth = prompt('Enter the new width:');
          const newHeight = prompt('Enter the new height:');
      
          if (newWidth && newHeight) {
            const width = parseInt(newWidth);
            const height = parseInt(newHeight);
      
            if (width <= 800 && height <= 800) {
                this.image.classList.add('animate');  
              const canvas = document.createElement('canvas');
              const context = canvas.getContext('2d');

              setTimeout(() => {
                this.image.style.width = newWidth + 'px';
                this.image.style.height = newHeight + 'px';
            
                // Remove animate class after the animation is complete
                setTimeout(() => {
                  this.image.classList.remove('animate');
                }, 300); // Adjust the delay to match the animation duration in milliseconds
              }, 10); 
      
              const img = new Image();
              img.onload = () => {
                canvas.width = width;
                canvas.height = height;
                context.drawImage(img, 0, 0, width, height);
      
                const resizedImageData = canvas.toDataURL('image/png');
                const blob = this.dataURLToBlob(resizedImageData);
      
                this.image.src = URL.createObjectURL(blob);
                this.imageData = blob;
                this.applyTransformations();
                this.notifyObservers();
              };
              img.src = this.image.src;
            } else {
              alert('Dimensions should be within 800x800 limit.');
            }
          }
        }
      }      
  
    saveTransformedImage() {
      if (this.imageData) {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
  
        const img = new Image();
        img.onload = () => {
          canvas.width = img.width;
          canvas.height = img.height;
          context.drawImage(img, 0, 0);
  
          if (this.isFlipped || this.rotation !== 0) {
            this.applyTransformationsToCanvas(canvas);
          }
  
          const editedImageData = canvas.toDataURL('image/png');
          const downloadLink = document.createElement('a');
          downloadLink.href = editedImageData;
          downloadLink.download = 'edited_image.png';
          downloadLink.click();
        };
        img.src = URL.createObjectURL(this.imageData);
      }
    }
  
    applyTransformationsToCanvas(canvas) {
      const context = canvas.getContext('2d');
      const tempCanvas = document.createElement('canvas');
      const tempContext = tempCanvas.getContext('2d');
      tempCanvas.width = canvas.width;
      tempCanvas.height = canvas.height;
      tempContext.drawImage(canvas, 0, 0);
  
      const maxDimension = Math.max(canvas.width, canvas.height);
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const rotateAngle = (this.rotation * Math.PI) / 180;
  
      canvas.width = maxDimension;
      canvas.height = maxDimension;
  
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.save();
      context.translate(centerX, centerY);
      context.rotate(rotateAngle);
      context.scale(this.isFlipped ? -1 : 1, 1);
  
      // Bicubic interpolation
      const resizedCanvas = document.createElement('canvas');
      const resizedContext = resizedCanvas.getContext('2d');
      resizedCanvas.width = canvas.width;
      resizedCanvas.height = canvas.height;
      resizedContext.drawImage(
        tempCanvas,
        0,
        0,
        tempCanvas.width,
        tempCanvas.height,
        0,
        0,
        resizedCanvas.width,
        resizedCanvas.height
      );
  
      context.drawImage(
        resizedCanvas,
        -canvas.width / 2,
        -canvas.height / 2,
        canvas.width,
        canvas.height
      );
  
      context.restore();
    }
  
    applyTransformations() {
      let transform = '';
  
      if (this.isFlipped) {
        transform += 'scaleX(-1) ';
      }
  
      if (this.rotation !== 0) {
        transform += `rotate(${this.rotation}deg)`;
      }
  
      this.image.style.transform = transform;
      this.image.style.transition = 'transform 0.3s ease';
    }
  
    dataURLToBlob(dataURL) {
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
  
  const imageEditor = new ImageEditor();
  
  const observer = {
    update: () => {
      console.log('Image editor state has changed.');
    }
  };
  
  imageEditor.subscribe(observer);
  