import type {Meta, StoryObj} from '@storybook/react-vite'

import StyledSwipeableDrawer from '../StyledSwipeableDrawer/StyledSwipeableDrawer'
import {Card} from '@mui/material'
import styles from "../TrendsDrawer/TrendsDrawer.module.scss";

const meta = {
    title: 'StyledSwipeableDrawer',
    component: StyledSwipeableDrawer,
    decorators: [
        (Story) => (
            <div style={{position: 'relative'}}>
                <Story/>
            </div>
        )
    ]
} satisfies Meta<typeof StyledSwipeableDrawer>
export default meta

type Story = StoryObj<typeof meta>

export const LeftOpen: Story = {
    args: {
        anchor: 'left',
        open: true,
        onOpen: () => {
        },
        onClose: () => {
        },
        handleClick: () => {
        },
        children: (
            <>
                <div>
                    <h2>Pollution layers</h2>
                    <Card>Placeholder card
                    </Card>
                </div>
            </>
        ),
    },
}

export const RightOpen: Story = {
    args: {
        anchor: 'right',
        open: true,
        onOpen: () => {
        },
        onClose: () => {
        },
        handleClick: () => {
        },
        children: (
            <>
                <div
                >
                    <h2>Pollution layers</h2>
<Card>Placeholder card
                    </Card>
                </div>
            </>
        ),
    },
}

export const BottomClosedPersistent: Story = {
    args: {
        anchor: 'bottom',
        open: false,
        onOpen: () => {
        },
        onClose: () => {
        },
        handleClick: () => {
        },
        testId: 'bottom',
        variant: 'persistent',
        children: (
            <>
                <div>
                    <h2>Pollution layers</h2>
<Card>Placeholder card
                    </Card>
                </div>
            </>
        ),
    },
    play: async ({canvas, userEvent}) => {
        await userEvent.click(canvas.getByTestId('bottom-drawer-puller'))
    }
}
export const BottomOpenPersistent: Story = {
    args: {
        anchor: 'bottom',
        open: true,
        onOpen: () => {
        },
        onClose: () => {
        },
        handleClick: () => {
        },
        variant: 'persistent',
        children: (
            <>
                <div className={styles['drawer-tab']}>
                    <h2>Regional trends</h2>
                </div>

                <div className={styles['graphs-container']}>
<Card>Placeholder card
                    </Card>
                </div>
            </>
        ),
    },
}
