import React, { CSSProperties, FC } from 'react'

import EditSvg from './edit.svg'
import ScaleSvg from './scale.svg'
import UserSvg from './user.svg'
import FileSvg from './file.svg'
import CrossSvg from './cross.svg'
import UpSvg from './up.svg'

import ButtonDiv from '@/components/ui/TextButton'

type IconProps = {
  style?: CSSProperties
  stroke?: string
  strokeWidth?: number
  onClick?: () => void
}

const createIcon = (SvgComponent: FC<React.SVGProps<SVGSVGElement>>) => {
  const Icon: FC<IconProps> = ({
    style,
    stroke = '#000',
    strokeWidth = 1,
    onClick,
  }) => {
    const svgElement = (
      <SvgComponent
        width="1.5rem"
        stroke={stroke}
        strokeWidth={`${strokeWidth * 2}rem`}
        style={{ userSelect: 'none', ...style }}
      />
    )

    return onClick ? (
      <ButtonDiv onClick={onClick} style={{ userSelect: 'none', display: 'flex', alignItems: 'center' }}>
        {svgElement}
      </ButtonDiv>
    ) : (
      svgElement
    )
  }

  return Icon
}

export const EditIcon  = createIcon(EditSvg)
export const ScaleIcon = createIcon(ScaleSvg)
export const UserIcon  = createIcon(UserSvg)
export const FileIcon  = createIcon(FileSvg)
export const UpIcon    = createIcon(UpSvg)
export const CrossIcon = createIcon(CrossSvg)
