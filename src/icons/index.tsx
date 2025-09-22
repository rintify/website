import React, { CSSProperties, FC, HTMLAttributes, ReactElement, Ref, RefAttributes } from 'react'

import EditSvg from './edit.svg'
import ZoomSvg from './zoom.svg'
import ScaleSvg from './scale.svg'
import UserSvg from './user.svg'
import FileSvg from './file.svg'
import CrossSvg from './cross.svg'
import UpSvg from './up.svg'
import LoosSvg from './loos.svg'
import ObjectSvg from './object.svg'
import BasisSvg from './basis.svg'
import ButtonDiv from '@/components/ui/TextButton'
import AddSvg from './add.svg'

type IconProps = {
  style?: CSSProperties
  iconStyle?: CSSProperties
  stroke?: string
  strokeWidth?: number
  onClick?: () => void
  ref?: React.RefObject<SVGSVGElement & HTMLDivElement|null>
}

const createIcon = (SvgComponent: FC<React.SVGProps<SVGSVGElement>>) => {
  const Icon: FC<IconProps> = ({
    style,
    iconStyle,
    stroke = '#000',
    strokeWidth = 1,
    onClick,
    ...rest
  }) => {

    return onClick ? (
      <ButtonDiv onClick={onClick} style={{width: '1.5rem',userSelect: 'none', display: 'flex', alignItems: 'center', ...style }} {...rest}>
        <SvgComponent
        width='100%'
        stroke={stroke}
        strokeWidth={`${strokeWidth * 2}rem`}
        style={{ userSelect: 'none', ...iconStyle }}
      />
      </ButtonDiv>
    ) : (
      <SvgComponent
        width='1.5rem'
        stroke={stroke}
        strokeWidth={`${strokeWidth * 2}rem`}
        style={{ userSelect: 'none', ...(style ?? iconStyle) }}
        {...rest}
      />
    )
  }

  return Icon
}

export const EditIcon  = createIcon(EditSvg)
export const ZoomIcon  = createIcon(ZoomSvg)
export const LoosIcon  = createIcon(LoosSvg)
export const ScaleIcon = createIcon(ScaleSvg)
export const UserIcon  = createIcon(UserSvg)
export const FileIcon  = createIcon(FileSvg)
export const UpIcon    = createIcon(UpSvg)
export const CrossIcon = createIcon(CrossSvg)
export const ObjectIcon = createIcon(ObjectSvg)
export const BasisIcon = createIcon(BasisSvg)
export const AddIcon = createIcon(AddSvg)