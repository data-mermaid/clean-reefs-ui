import * as React from 'react';
import SwipeableDrawer from '@mui/material/SwipeableDrawer';
import styles from './StyledSwipeableDrawer.module.scss';

interface SwipeableDrawerProps {
    anchor?: 'left' | 'right';
    children?: React.ReactNode;
    open: boolean;
    onOpen: () => void;
    onClose: () => void;
}

export default function StyledSwipeableDrawer({
                                                  anchor = 'left',
                                                  children,
                                                  open,
                                                  onOpen,
                                                  onClose,
                                              }: SwipeableDrawerProps) {
    return (
        <SwipeableDrawer anchor={anchor} open={open} onOpen={onOpen} onClose={onClose} className={styles.MuiSwipeableDrawer}>
            {children}
        </SwipeableDrawer>
    );
}