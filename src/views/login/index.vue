<template>
  <div class="login-container">
    <div class="login-content">
      <div class="login-info">
        <p class="title">小鹅家教 · 运营管理平台</p>
        <p class="info">
          面向一对一家教业务，统一管理老师入驻与资质、辅导课程与课时包、约课订单、排课和课后记录。通过师生关系与反馈工单跟进教学服务。
        </p>
        <p class="info">请使用平台分配的管理账号登录。可访问的菜单与操作由账号角色决定。</p>
      </div>
      <div class="login-panel">
        <el-form ref="formRef" v-loading="loading" :model="loginForm" :rules="rules" label-position="left" @keyup.enter="handleLogin()">
          <h3 class="login-head">管理员登录</h3>
          <el-form-item class="form-group" prop="mobile">
            <el-input v-model="loginForm.mobile" placeholder="用户名" aria-label="用户名" autocomplete="username" />
          </el-form-item>
          <el-form-item class="form-group" prop="mobilePwd">
            <el-input v-model="loginForm.mobilePwd" placeholder="密码" aria-label="密码" type="password" autocomplete="current-password" show-password />
          </el-form-item>
          <el-form-item class="form-group" prop="verCode">
            <div class="ver-row">
              <el-input v-model="loginForm.verCode" class="var-input" placeholder="验证码" aria-label="验证码" autocomplete="off" />
              <button class="var-button" type="button" aria-label="看不清，换一张" @click="getCaptcha">
                <img v-if="verImg" class="var-img" :src="verImg" alt="图形验证码" />
                <span v-else class="var-placeholder">获取验证码</span>
              </button>
            </div>
          </el-form-item>
          <el-button class="login-button" type="primary" @click="handleLogin">登 录</el-button>
        </el-form>
      </div>
    </div>
    <div class="footer">
      <div v-if="service.websiteCopyright" class="copyright">{{ service.websiteCopyright }}</div>
      <div>
        <a v-if="service.websiteIcp" href="http://beian.miit.gov.cn/" target="_blank">{{ service.websiteIcp }}</a>
        <span v-if="service.websiteIcp && service.websitePrn" class="footer-sep" aria-hidden="true">|</span>
        <img v-if="service.websitePrn" class="website-prn" :alt="service.websitePrn" src="../../assets/images/common/beian.png" />
        <a v-if="service.websitePrn" :href="'http://www.beian.gov.cn/portal/registerSystemInfo?recordcode=' + service.websitePrnNo" target="_blank">&nbsp;{{ service.websitePrn }} </a>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { loginApi } from '@/api/login'
  import { onMounted, reactive, ref } from 'vue'
  import { setToken } from '@/utils/cookie'
  import { useRouter } from 'vue-router'
  import { useUserStore } from '@/store/modules/user'
  import { createNewRouter } from '@/router'
  import { PATH } from '@/utils/constants/system'
  import { encrypt } from '@/utils/base.js'

  const router = useRouter()
  const loading = ref(false)
  const verImg = ref()
  const formRef = ref()

  // 站点信息
  const service = ref({})
  onMounted(() => {
    loginApi.getWebsite().then((res) => {
      service.value = res
    })
    // 验证码
    getCaptcha()
  })

  // 登录
  const loginForm = reactive({
    mobile: '',
    mobilePwd: '',
    verCode: '',
    verToken: ''
  })

  // 必填校验，错误提示显示在字段下方
  const rules = {
    mobile: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
    mobilePwd: [{ required: true, message: '请输入密码', trigger: 'blur' }],
    verCode: [{ required: true, message: '请输入验证码', trigger: 'blur' }]
  }

  // 获取验证码
  async function getCaptcha() {
    try {
      const res = await loginApi.getCodeImg()
      loginForm.verToken = res.verToken
      loginForm.verCode = ''
      verImg.value = res.img
    } catch (error) {
      console.error(error)
    }
  }

  async function handleLogin() {
    if (loading.value) return
    const valid = await formRef.value?.validate().catch(() => false)
    if (!valid) return

    loading.value = true
    try {
      // 密码加密
      const payload = {
        ...loginForm,
        mobilePwdEncrypt: encrypt(loginForm.mobilePwd, service.value.rsaLoginPublicKey)
      }
      delete payload.mobilePwd
      const res = await loginApi.login(payload)
      // 存入cookie
      setToken(res.token)
      // 更新store
      useUserStore().login(res)
      // 初始化路由
      createNewRouter(res.routerList)
      await router.push(PATH.URL_DASHBOARD)
    } catch (error) {
      console.error(error)
      await getCaptcha()
    } finally {
      loading.value = false
    }
  }
</script>

<style lang="scss" scoped>
  .login-container {
    position: relative;
    box-sizing: border-box;
    min-height: 100vh;
    background: var(--xe-ink-100);
  }

  .login-content {
    position: absolute;
    top: calc((100vh - 520px) / 2);
    left: 0;
    right: 0;
    display: flex;
    width: 800px;
    margin: 0 auto;
    overflow: hidden;
    border-radius: 16px;
    box-shadow: 0 16px 40px rgba(37, 99, 235, 0.14);

    .login-info {
      box-sizing: border-box;
      width: 400px;
      min-height: 480px;
      padding: 40px 36px;
      color: #fff;
      background: linear-gradient(135deg, var(--xe-brand-700), var(--xe-brand-800));

      .title {
        margin: 0;
        font-size: 22px;
        font-weight: 700;
      }

      .info {
        margin: 16px 0 0;
        color: var(--xe-brand-100);
        font-size: 15px;
        line-height: 1.75;
      }
    }

    .login-panel {
      box-sizing: border-box;
      width: 400px;
      padding: 40px 36px;
      background: #fff;

      .login-head {
        margin: 0 0 28px;
        color: var(--xe-ink-900);
        font-size: 24px;
        font-weight: 700;
        text-align: center;
      }

      .form-group {
        margin-bottom: 22px;
      }

      .login-button {
        width: 100%;
        height: 44px;
        margin-top: 8px;
        font-size: 16px;
        font-weight: 700;
      }
    }
  }

  .footer {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    padding-bottom: 20px;
    color: var(--xe-ink-600);
    font-size: 13px;
    line-height: 25px;
    text-align: center;

    a {
      color: var(--xe-ink-600);
      text-decoration: none;

      &:hover {
        color: var(--xe-brand-700);
        text-decoration: underline;
      }
    }

    .footer-sep {
      margin: 0 12px;
    }

    .website-prn {
      width: auto;
      vertical-align: middle;
    }
  }

  .ver-row {
    display: flex;
    align-items: center;
    gap: 12px;
    width: 100%;
  }

  .var-input {
    flex: 1;
    min-width: 0;
  }

  .var-button {
    flex: none;
    display: grid;
    place-items: center;
    width: 104px;
    height: 40px;
    padding: 0;
    overflow: hidden;
    background: #fff;
    border: 1px solid var(--el-border-color);
    border-radius: 8px;
    cursor: pointer;

    &:hover {
      border-color: var(--xe-brand-600);
    }

    &:focus-visible {
      outline: none;
      box-shadow: var(--xe-focus-ring);
    }
  }

  .var-img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: contain;
  }

  .var-placeholder {
    color: var(--xe-brand-700);
    font-size: 13px;
  }

  .el-input {
    height: 40px;
  }

  @media (max-width: 840px), (max-height: 680px) {
    .login-container {
      padding: 24px 16px;
    }

    .login-content {
      position: static;
      width: 100%;
      max-width: 400px;

      .login-info {
        display: none;
      }

      .login-panel {
        width: 100%;
        min-height: 400px;
      }
    }

    .footer {
      position: static;
      margin-top: 24px;
      overflow-wrap: anywhere;
    }
  }
</style>
