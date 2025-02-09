<template>
  <Modal
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    title="Take Photo"
    max-width="max-w-[95vh]"
    :no-padding="true"
  >
    <div class="relative max-h-[95vh] flex flex-col">
      <!-- Camera View -->
      <div 
        class="flex-1 aspect-[3/4] bg-black rounded-lg overflow-hidden"
        :class="{ 'hidden': showPreview }"
      >
        <video
          ref="videoRef"
          class="w-full h-full object-cover"
          autoplay
          playsinline
        ></video>

        <!-- No Camera Permission State -->
        <div
          v-if="!hasPermission && !loading"
          class="absolute inset-0 flex flex-col items-center justify-center text-white p-6"
        >
          <svg
            class="w-12 h-12 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
            />
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          <p class="text-center mb-4">
            Camera access is required to take photos
          </p>
          <button
            @click="requestPermission"
            class="px-4 py-2 bg-white text-black rounded-lg hover:bg-gray-100 transition-colors"
          >
            Enable Camera
          </button>
        </div>

        <!-- Loading State -->
        <div
          v-if="loading"
          class="absolute inset-0 flex items-center justify-center text-white"
        >
          <svg
            class="animate-spin h-8 w-8"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              class="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
            ></circle>
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        </div>
      </div>

      <!-- Photo Preview -->
      <div
        v-if="showPreview"
        class="flex-1 aspect-[3/4] bg-black rounded-lg overflow-hidden"
      >
        <img
          :src="previewUrl"
          class="w-full h-full object-cover"
          alt="Captured photo"
        />
      </div>

      <!-- Camera Controls -->
      <div class="absolute inset-x-0 bottom-0 pb-6 flex justify-center">
        <div
          class="bg-black/50 backdrop-blur-sm rounded-full p-4 flex items-center gap-4"
        >
          <template v-if="!showPreview">
            <button
              @click="capturePhoto"
              class="w-16 h-16 rounded-full border-4 border-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white"
              :disabled="!hasPermission || loading"
            ></button>
          </template>
          <template v-else>
            <button
              @click="retakePhoto"
              class="px-4 py-2 text-white hover:text-gray-200 transition-colors rounded-lg"
            >
              Retake
            </button>
            <button
              @click="uploadPhoto"
              class="px-4 py-2 bg-white text-black rounded-lg hover:bg-gray-100 transition-colors"
            >
              Upload
            </button>
          </template>
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

const videoRef = ref<HTMLVideoElement>()
const stream = ref<MediaStream>()
const hasPermission = ref(false)
const loading = ref(true)
const showPreview = ref(false)
const previewUrl = ref('')
const photoBlob = ref<Blob>()

// Initialize camera when modal opens
watch(() => props.modelValue, async (isOpen) => {
  if (isOpen) {
    await initCamera()
  } else {
    cleanup()
  }
})

const initCamera = async () => {
  loading.value = true
  try {
    stream.value = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'environment' }
    })
    if (videoRef.value) {
      videoRef.value.srcObject = stream.value
    }
    hasPermission.value = true
  } catch (err) {
    hasPermission.value = false
    console.error('Camera error:', err)
  }
  loading.value = false
}

const requestPermission = () => {
  initCamera()
}

const capturePhoto = () => {
  if (!videoRef.value || !stream.value) return

  const video = videoRef.value
  const canvas = document.createElement('canvas')
  canvas.width = video.videoWidth
  canvas.height = video.videoHeight
  
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  
  ctx.drawImage(video, 0, 0)
  
  canvas.toBlob((blob) => {
    if (!blob) return
    photoBlob.value = blob
    previewUrl.value = URL.createObjectURL(blob)
    showPreview.value = true
  }, 'image/png')
}

const retakePhoto = () => {
  showPreview.value = false
  previewUrl.value = ''
  photoBlob.value = undefined
}

const uploadPhoto = () => {
  if (!photoBlob.value) return
  emit('upload', photoBlob.value)
  // Reset for next photo instead of closing
  photoBlob.value = undefined
  showPreview.value = false
}

const cleanup = () => {
  if (stream.value) {
    stream.value.getTracks().forEach(track => track.stop())
  }
  if (videoRef.value) {
    videoRef.value.srcObject = null
  }
  stream.value = undefined
  showPreview.value = false
  previewUrl.value = ''
  photoBlob.value = undefined
}

onUnmounted(() => {
  cleanup()
})
</script>
