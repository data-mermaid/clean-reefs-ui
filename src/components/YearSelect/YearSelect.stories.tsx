import type { Meta, StoryObj } from '@storybook/react-vite'
import YearSelect from './YearSelect'
import { BrowserRouter } from 'react-router-dom'
import { FilterSelectProvider } from '../../contexts/FilterSelectProvider'

const meta: Meta<typeof YearSelect> = {
  title: 'Components/YearSelect',
  component: YearSelect,
  parameters: { layout: 'centered' },
  decorators: [
    (Story) => (
      <BrowserRouter>
        <FilterSelectProvider>
          <Story />
        </FilterSelectProvider>
      </BrowserRouter>
    ),
  ],
}

type Story = StoryObj<typeof YearSelect>

export const Primary: Story = {
  args: {},
}

export const Disabled: Story = {
  args: {
    disabled: true,
  },
}

export default meta
