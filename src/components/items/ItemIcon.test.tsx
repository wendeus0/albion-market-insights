import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { ItemIcon } from '@/components/items/ItemIcon';
import { buildCdnIconUrl, LOCAL_FALLBACK_ICON } from '@/components/items/itemIcon.utils';

describe('ItemIcon', () => {
  it('deve montar URL da CDN com itemId codificado', () => {
    expect(buildCdnIconUrl('T8_2H_HOLYSTAFF@3')).toBe(
      'https://render.albiononline.com/v1/item/T8_2H_HOLYSTAFF%403.png?size=64',
    );
  });

  it('deve renderizar com CDN como origem primária', () => {
    render(<ItemIcon itemId="T5_MAIN_SWORD" itemName="Expert's Broadsword" />);

    const icon = screen.getByRole('img', { name: /icon for expert's broadsword/i });
    expect(icon).toHaveAttribute('src', buildCdnIconUrl('T5_MAIN_SWORD'));
  });

  it('deve cair para fallback local quando a imagem da CDN falha', () => {
    render(<ItemIcon itemId="T5_MAIN_SWORD" itemName="Expert's Broadsword" />);

    const icon = screen.getByRole('img', { name: /icon for expert's broadsword/i });
    fireEvent.error(icon);

    expect(icon).toHaveAttribute('src', LOCAL_FALLBACK_ICON);
  });

  it('deve resetar para CDN ao trocar itemId após fallback', () => {
    const { rerender } = render(
      <ItemIcon itemId="T5_MAIN_SWORD" itemName="Expert's Broadsword" />,
    );

    const icon = screen.getByRole('img', { name: /icon for expert's broadsword/i });
    fireEvent.error(icon);
    expect(icon).toHaveAttribute('src', LOCAL_FALLBACK_ICON);

    rerender(<ItemIcon itemId="T6_MAIN_SWORD" itemName="Master's Broadsword" />);

    const updatedIcon = screen.getByRole('img', { name: /icon for master's broadsword/i });
    expect(updatedIcon).toHaveAttribute('src', buildCdnIconUrl('T6_MAIN_SWORD'));
  });
});

