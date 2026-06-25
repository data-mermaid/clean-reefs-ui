import { Card, Skeleton } from '@mui/material'
import styles from './ChartCardSkeleton.module.scss'

export default function ChartCardSkeleton() {
  return (
    <Card className={styles['chart-card-skeleton']}>
      <Skeleton variant="text" width="40%" height={14} animation="wave" />
      <Skeleton variant="text" width="70%" height={20} animation="wave" />
      <Skeleton
        variant="rectangular"
        width="100%"
        height={200}
        animation="wave"
        className={styles['chart-card-skeleton__chart-area']}
      />
      <div className={styles['chart-card-skeleton__legend']}>
        <Skeleton variant="text" width="18%" height={12} animation="wave" />
        <Skeleton variant="text" width="15%" height={12} animation="wave" />
        <Skeleton variant="text" width="20%" height={12} animation="wave" />
        <Skeleton variant="text" width="16%" height={12} animation="wave" />
      </div>
    </Card>
  )
}
