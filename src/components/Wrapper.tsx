import { XIcon } from 'lucide-preact';
import { h } from 'preact';
import useIsMobile from '../hooks/useIsMobile';
import { PlacementType, Theme } from '../types';
import { calculateTextColor, cn } from '../utils';
import Progress from './Progress';

interface ContainerProps {
  children: preact.ComponentChildren;
  fullScreen?: boolean;
  placement?: PlacementType;
  close?: () => void;
  background?: string;
  progress: number;
  showProgressBar?: boolean;
  showBranding?: boolean;
  theme?: Theme;
  maxWidth?: string;
  minWidth?: string;
}

export const Wrapper: preact.FunctionComponent<ContainerProps> = ({
  children,
  fullScreen,
  placement,
  close,
  background = '#FFFFFF',
  progress,
  showProgressBar,
  showBranding = true,
  theme,
  maxWidth,
  minWidth
}) => {
  const showTopBar = showProgressBar || !fullScreen;
  const isMobile = useIsMobile();

  let webPositionClasses = '';
  if (!fullScreen && !isMobile) {
    webPositionClasses = cn(
      'fixed z-[2147483650]',
      placement === 'topLeft' ? 'top-5 left-5' : '',
      placement === 'topRight' ? 'top-5 right-5' : '',
      placement === 'bottomLeft' ? 'bottom-5 left-5' : '',
      placement === 'bottomRight' ? 'bottom-5 right-5' : '',
      placement === 'center'
        ? 'left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2'
        : ''
    );
  }

  return (
    <div
      className={cn(
        webPositionClasses,
        !fullScreen && isMobile ? 'absolute bottom-0' : ''
      )}
      id={'integraflow-content-wrapper'}
    >
      <div
        className={cn(
          'p-6 flex flex-col items-center',
          !fullScreen && !isMobile ? 'shadow-3xl rounded-2xl w-fit max-h-[600px]' : '',
          !fullScreen && isMobile
            ? 'rounded-t-2xl w-screen max-h-[600px] shadow-3xl'
            : '',
          fullScreen ? 'w-screen h-screen' : ''
        )}
        style={{
          backgroundColor: background,
          maxWidth:
            !fullScreen && !isMobile && maxWidth ? maxWidth : '100%',
          minWidth: !fullScreen && !isMobile ? minWidth : undefined
        }}
      >
        {showTopBar && (
          <div
            className={cn(
              'flex items-center gap-2 w-full mb-1',
              !fullScreen && !showProgressBar ? 'justify-end' : '' // Set forceClose button to the right.
            )}
          >
            {showProgressBar && (
              <Progress bgColor={theme?.progressBar} progress={progress} />
            )}
            {!fullScreen && (
              <button onClick={close}>
                <XIcon
                  color={calculateTextColor(theme?.background ?? '#FFFFFF')}
                />
              </button>
            )}
          </div>
        )}

        <div
          className={cn(
            'flex-1 w-full h-full overflow-auto',
            fullScreen ? 'flex flex-col justify-around' : ''
          )}
          style={{
            maxWidth:
              fullScreen && !isMobile && maxWidth ? maxWidth : '100%',
          }}
        >
          <div>{children}</div>
        </div>

        {showBranding && <footer
          className={cn(isMobile ? "mt-3" : "mt-6")}
          style={{
            fontSize: '12px',
            fontWeight: 400,
            lineHeight: 1.5,
            color: calculateTextColor(theme?.background ?? '#FFFFFF'),
          }}
        >
          Powered by{' '}
          <a href="https://useintegraflow.com" target="_blank">
            <b style={{ fontWeight: 600, fontSize: '14px' }}>Integraflow</b>
          </a>
        </footer>}
      </div>
    </div>
  );
};
