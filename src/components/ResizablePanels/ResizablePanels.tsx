import { ReactNode, useEffect, useRef, useState } from 'react'
import {
  Panel,
  PanelGroup,
  PanelResizeHandle,
  ImperativePanelHandle
} from 'react-resizable-panels'
import styles from './ResizablePanels.module.scss'

interface ResizablePanelsProps {
  leftPanel: ReactNode
  rightPanel: ReactNode
  leftPanelTitle?: string
  rightPanelTitle?: string
  initialLeftSize?: number
  initialRightSize?: number
  storageKeyPrefix?: string
  minPanelSize?: number
  showControls?: boolean
  leftButtonLabel?: string
  rightButtonLabel?: string
  onResizeEnd?: (sizes: number[]) => void
}

export const ResizablePanels = ({
  leftPanel,
  rightPanel,
  leftPanelTitle,
  rightPanelTitle,
  initialLeftSize = 50,
  initialRightSize = 50,
  storageKeyPrefix = '',
  minPanelSize = 20,
  showControls = true,
  leftButtonLabel = 'Левая',
  rightButtonLabel = 'Правая',
  onResizeEnd
}: ResizablePanelsProps) => {
  const leftSizeKey = `${storageKeyPrefix}leftPanelSize`
  const rightSizeKey = `${storageKeyPrefix}rightPanelSize`
  
  const [isMobile, setIsMobile] = useState(false)
  const [leftPanelSize, setLeftPanelSize] = useState(() => {
    const saved = localStorage.getItem(leftSizeKey)
    return saved ? parseInt(saved, 10) : initialLeftSize
  })
  const [rightPanelSize, setRightPanelSize] = useState(() => {
    const saved = localStorage.getItem(rightSizeKey)
    return saved ? parseInt(saved, 10) : initialRightSize
  })
  
  const leftPanelRef = useRef<ImperativePanelHandle>(null)
  const rightPanelRef = useRef<ImperativePanelHandle>(null)

  // Определение мобильного режима
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth <= 1024)
    }
    
    checkIfMobile()
    window.addEventListener('resize', checkIfMobile)
    
    return () => {
      window.removeEventListener('resize', checkIfMobile)
    }
  }, [])
  
  // Обработчик изменения размера панелей
  const handleResize = (sizes: number[]) => {
    const [left, right] = sizes
    setLeftPanelSize(left)
    setRightPanelSize(right)
    
    localStorage.setItem(leftSizeKey, left.toString())
    localStorage.setItem(rightSizeKey, right.toString())
    
    if (onResizeEnd) {
      onResizeEnd(sizes)
    }
  }
  
  // Предустановленные размеры
  const setPresetSizes = (leftSize: number, rightSize: number) => {
    if (leftPanelRef.current && rightPanelRef.current) {
      leftPanelRef.current.resize(leftSize)
      rightPanelRef.current.resize(rightSize)
    }
  }

  return (
    <div className={styles.container}>
      {showControls && (
        <div className={styles.controls}>
          <button 
            className={styles.controlButton} 
            onClick={() => setPresetSizes(50, 50)}
            title="Сбалансированный режим"
          >
            50/50
          </button>
          <button 
            className={styles.controlButton} 
            onClick={() => setPresetSizes(70, 30)}
            title={`Больше ${leftButtonLabel}`}
          >
            {leftButtonLabel}
          </button>
          <button 
            className={styles.controlButton} 
            onClick={() => setPresetSizes(30, 70)}
            title={`Больше ${rightButtonLabel}`}
          >
            {rightButtonLabel}
          </button>
        </div>
      )}
      
      <div className={styles.panelsContainer}>
        <PanelGroup 
          direction={isMobile ? "vertical" : "horizontal"}
          onLayout={handleResize}
        >
          <Panel 
            ref={leftPanelRef}
            defaultSize={leftPanelSize} 
            minSize={minPanelSize} 
            className={styles.panelLeft}
          >
            <div className={styles.panelContent}>
              {leftPanelTitle && <h3 className={styles.panelTitle}>{leftPanelTitle}</h3>}
              {leftPanel}
            </div>
          </Panel>
          
          <PanelResizeHandle className={styles.resizeHandle} />
          
          <Panel 
            ref={rightPanelRef}
            defaultSize={rightPanelSize} 
            minSize={minPanelSize} 
            className={styles.panelRight}
          >
            <div className={styles.panelContent}>
              {rightPanelTitle && <h3 className={styles.panelTitle}>{rightPanelTitle}</h3>}
              {rightPanel}
            </div>
          </Panel>
        </PanelGroup>
      </div>
    </div>
  )
} 