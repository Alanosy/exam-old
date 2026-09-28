<template>
  <div v-if="srcList.length" class="audio-player-list">
    <div v-for="(url, index) in srcList" :key="index + '-' + url" class="audio-player">
      <audio
        ref="players"
        :src="mediaSrc(url)"
        preload="none"
        @play="playingIndex = index"
        @pause="onPause(index)"
        @ended="onPause(index)"
      />
      <el-button
        type="primary"
        size="mini"
        :icon="playingIndex === index ? 'el-icon-video-pause' : 'el-icon-video-play'"
        @click="toggle(index)"
      >
        {{ playingIndex === index ? '暂停' : '播放' }}
      </el-button>
      <span class="audio-name">{{ audioLabel(index) }}</span>
    </div>
  </div>
</template>

<script>
import { fileNameFromUrl, mediaSrc, parseAudioList } from '@/utils/audio'

export default {
  name: 'AudioPlayer',
  props: {
    src: {
      type: [String, Array],
      default: ''
    }
  },
  data() {
    return {
      playingIndex: -1
    }
  },
  computed: {
    srcList() {
      return parseAudioList(this.src)
    }
  },
  watch: {
    src() {
      this.playingIndex = -1
      this.pauseAll()
    }
  },
  methods: {
    mediaSrc,
    audioLabel(index) {
      return fileNameFromUrl(this.srcList[index])
    },
    playerList() {
      const players = this.$refs.players
      if (!players) {
        return []
      }
      return Array.isArray(players) ? players : [players]
    },
    pauseAll() {
      this.playerList().forEach(player => {
        if (player && !player.paused) {
          player.pause()
        }
      })
    },
    onPause(index) {
      if (this.playingIndex === index) {
        this.playingIndex = -1
      }
    },
    toggle(index) {
      const player = this.playerList()[index]
      if (!player) {
        return
      }
      if (player.paused) {
        this.playerList().forEach((item, i) => {
          if (i !== index && item && !item.paused) {
            item.pause()
          }
        })
        player.play()
      } else {
        player.pause()
      }
    }
  }
}
</script>

<style scoped>
.audio-player-list {
  margin: 8px 0 12px;
}
.audio-player {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}
.audio-player:last-child {
  margin-bottom: 0;
}
.audio-name {
  margin-left: 8px;
  color: #909399;
  font-size: 13px;
}
</style>
