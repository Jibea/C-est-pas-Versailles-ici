import { shallowMount } from '@vue/test-utils'
import LightComponent from '@/components/LightComponent.vue'

describe('LightComponent.vue', () => {
  it('renders props.msg when passed', () => {
    const msg = 'new message'
    const wrapper = shallowMount(LightComponent, {
      props: { msg }
    })
    expect(wrapper.text()).toMatch(msg)
  })
})
