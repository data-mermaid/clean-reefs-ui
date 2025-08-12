import type { Meta, StoryObj } from '@storybook/react-vite'

import TrendsDrawer from './TrendsDrawer'
import { Card, IconButton, Switch } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'

const meta = {
  component: TrendsDrawer,
} satisfies Meta<typeof TrendsDrawer>

type Story = StoryObj<typeof meta>

export const Primary: Story = {}

// args: {
// anchor: 'bottom',
// open: false,
// onOpen: () => {},
// // onClose: () => {},
// children: (
//     <>
//         <div
//             style={{
//                 fontSize: '16px',
//                 fontWeight: '700',
//                 position: open ? 'sticky' : 'relative',
//                 top: -8,
//                 left: 0,
//                 display: 'flex',
//                 justifyContent: 'space-between',
//             }}
//         >
//             <h2 style={{marginTop: open ? '4px' : '0'}}>{t('global_trends')}</h2>
//             {open && (
//                 <IconButton aria-label={t('buttons.close')} onClick={handleCardClick}>
//                     <CloseIcon />
//                 </IconButton>
//             )}
//         </div>
//     </>
// ),
// },
// }

export default meta
