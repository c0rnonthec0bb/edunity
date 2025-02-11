<template>
  <Modal
    :modelValue="modelValue"
    @update:modelValue="$emit('update:modelValue', $event)"
    title="Take Photo"
    :actions="[]"
    maxWidth="max-w-md"
  >
    <div class="space-y-4">
      <div class="relative aspect-[3/4] bg-black rounded-lg overflow-hidden">
        <video
          v-show="!photo"
          ref="video"
          class="w-full h-full object-cover"
          autoplay
          playsinline
          muted
          @click="capture"
        ></video>
        <img
          v-show="photo"
          :src="photo"
          class="w-full h-full object-cover"
          alt="Captured photo"
        />
        
        <!-- Capture button overlay -->
        <div v-if="!photo" class="absolute inset-x-0 bottom-0 p-6 flex justify-center">
          <div class="w-20 h-20 bg-black/40 backdrop-blur-sm rounded-full flex items-center justify-center">
            <button
              @click="capture"
              class="w-10 h-10 rounded-full bg-white relative focus:outline-none"
            >
              <div class="absolute inset-0 rounded-full border-4 border-white -m-2"></div>
              <div class="absolute inset-0 rounded-full bg-white"></div>
            </button>
          </div>
        </div>

        <!-- Action buttons overlay -->
        <div 
          v-if="photo" 
          class="absolute inset-x-0 bottom-0 p-4 flex flex-col gap-2 bg-gradient-to-t from-black/80 to-transparent pt-16"
        >
          <button
            @click="retake"
            class="w-full px-4 py-3 text-sm font-medium text-white bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/30 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-theme-500 shadow-lg"
          >
            Retake Photo
          </button>
          <button
            @click="() => handleUpload(false)"
            class="w-full px-4 py-3 text-sm font-medium text-white bg-theme-500 rounded-lg hover:bg-theme-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-theme-500 shadow-lg"
          >
            Upload Photo
          </button>
          <button
            @click="() => handleUpload(true)"
            class="w-full px-4 py-3 text-sm font-medium text-white bg-theme-500 rounded-lg hover:bg-theme-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-theme-500 shadow-lg"
          >
            Upload & Take Another
          </button>
        </div>
      </div>
    </div>
  </Modal>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import Modal from './Modal.vue'

const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'upload', photo: Blob): void
}>()

const video = ref<HTMLVideoElement | null>(null)
const stream = ref<MediaStream | null>(null)
const photo = ref<string | null>(null)
const photoBlob = ref<Blob | null>(null)

// Initialize camera when component is mounted and modal is open
onMounted(async () => {
  if (props.modelValue) {
    await initCamera()
  }
})

// Watch for modal open/close to initialize/cleanup camera
watch(() => props.modelValue, async (isOpen) => {
  console.log('Modal state changed:', isOpen)
  if (isOpen) {
    await initCamera()
  } else {
    cleanup()
  }
})

const initCamera = async () => {
  console.log('Initializing camera...')
  try {
    if (!stream.value) {
      stream.value = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      })
    }
    
    // Wait for video ref to be available
    await new Promise(resolve => setTimeout(resolve, 100))
    
    if (video.value && stream.value) {
      console.log('Setting video source...')
      video.value.srcObject = stream.value
      await video.value.play()
      console.log('Video playing')
    } else {
      console.log('Video element or stream not available:', { video: !!video.value, stream: !!stream.value })
    }
  } catch (err) {
    console.error('Error accessing camera:', err)
  }
}

const cleanup = () => {
  console.log('Cleaning up camera...')
  if (stream.value) {
    stream.value.getTracks().forEach(track => track.stop())
  }
  if (video.value) {
    video.value.srcObject = null
  }
  stream.value = null
  if (photo.value) {
    URL.revokeObjectURL(photo.value)
  }
  photo.value = null
  photoBlob.value = null
}

onUnmounted(() => {
  cleanup()
})

const capture = () => {
  if (!video.value || !stream.value) return

  const canvas = document.createElement('canvas')
  canvas.width = video.value.videoWidth
  canvas.height = video.value.videoHeight
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  ctx.drawImage(video.value, 0, 0)
  
  // Convert to blob for upload
  canvas.toBlob((blob) => {
    if (blob) {
      photoBlob.value = blob
      photo.value = URL.createObjectURL(blob)
    }
  }, 'image/jpeg', 0.8)
}

const retake = () => {
  if (photo.value) {
    URL.revokeObjectURL(photo.value)
  }
  photo.value = null
  photoBlob.value = null
  initCamera() // Reinitialize camera when retaking
}

const handleUpload = (takeAnother: boolean) => {
  if (!photoBlob.value) return
  emit('upload', photoBlob.value)
  if (takeAnother) {
    retake()
  } else {
    emit('update:modelValue', false)
  }
}
</script>
