import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import YearSelect from './YearSelect'

const meta: Meta<typeof YearSelect> = {
  title: 'Components/YearSelect',
  component: YearSelect,
  parameters: { layout: 'centered' },
}

type Story = StoryObj<typeof YearSelect>

const StoryBookYearSelect = (props: React.ComponentProps<typeof YearSelect>) => {
  const { selectedYear: initialSelectedYear = 2020, onChange } = props
  const [selectedYear, setSelectedYear] = useState<number>(initialSelectedYear)

  const handleChange = (year: number) => {
    setSelectedYear(year)
    onChange?.(year)
  }

  return <YearSelect selectedYear={selectedYear} onChange={handleChange} />
}

export const Primary: Story = {
  render: (args) => <StoryBookYearSelect {...args} />,
  args: { selectedYear: 2020 },
}

export const Disabled: Story = {
  render: (args) => <StoryBookYearSelect {...args} />,
  args: {
    selectedYear: 2020,
    disabled: true,
  },
}

export default meta
