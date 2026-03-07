import { createElement, forwardRef, ForwardRefExoticComponent, PropsWithoutRef, RefAttributes } from 'react';

import { Theme, useTheme } from '@emotion/react';
import _styled from '@emotion/styled';
import { TwStyle } from 'twin.macro';

export type TTwStyle<T> = TwStyle | undefined | T;

type TWithTheme<T, TProps> = T & TProps;

export const styled = ((component: any, config: any) => {
  config = {
    shouldForwardProp:
      /**
       *  * prop이 $로 시작하지 않는 경우
       * @param {string} prop - prop
       * @returns {boolean} prop이 $로 시작하지 않는 경우
       */
      (prop: string): boolean => !prop.startsWith('$'),
    ...config,
  };
  return _styled(component, config);
}) as typeof _styled;

const tags =
  'a|abbr|address|area|article|aside|audio|b|base|bdi|bdo|big|blockquote|body|br|button|canvas|caption|cite|code|col|colgroup|data|datalist|dd|del|details|dfn|dialog|div|dl|dt|em|embed|fieldset|figcaption|figure|footer|form|h1|h2|h3|h4|h5|h6|head|header|hgroup|hr|html|i|iframe|img|input|ins|kbd|keygen|label|legend|li|link|main|map|mark|marquee|menu|menuitem|meta|meter|nav|noscript|object|ol|optgroup|option|output|p|param|picture|pre|progress|q|rp|rt|ruby|s|samp|script|section|select|small|source|span|strong|style|sub|summary|sup|table|tbody|td|textarea|tfoot|th|thead|time|title|tr|track|u|ul|var|video|wbr|circle|clipPath|defs|ellipse|foreignObject|g|image|line|linearGradient|mask|path|pattern|polygon|polyline|radialGradient|rect|stop|svg|text|tspan'.split(
    '|',
  );
for (const tag of tags) {
  (styled as any)[tag] = styled(tag as any);
}

/**
 * * 기본 props를 설정하는 함수
 * @template T
 * @template TProps
 * @param {React.ComponentType<T>} component - 래핑할 컴포넌트
 * @param {(args: { theme: Theme }) => Partial<T>} getDefaultProps - 기본 props를 설정하는 함수
 * @returns {ForwardRefExoticComponent<PropsWithoutRef<TWithTheme<T, TProps>> & RefAttributes<any>>} 래핑된 컴포넌트
 */
export const withDefaultProps = <T extends object, TProps>(
  component: React.ComponentType<T>,
  getDefaultProps: ((args: { theme: Theme; props?: TProps }) => Partial<T>) | Partial<T>,
): ForwardRefExoticComponent<PropsWithoutRef<TWithTheme<T, TProps>> & RefAttributes<any>> => {
  /**
   * * props를 받아 기본 props와 합쳐주는 컴포넌트
   * @param {TWithTheme<T, TProps>} props - 컴포넌트 props
   * @returns {React.ReactElement} 래핑된 컴포넌트
   */
  const ComponentWithProps = forwardRef<any, TWithTheme<T, TProps>>((props, ref) => {
    const theme = useTheme();
    const defaultProps =
      typeof getDefaultProps === 'function' ? getDefaultProps({ theme, props: props as TProps | undefined }) : getDefaultProps;

    return createElement(component, {
      ...defaultProps,
      ...(props as TWithTheme<T, TProps>),
      ref, // forward the ref
    });
  });

  return ComponentWithProps;
};
