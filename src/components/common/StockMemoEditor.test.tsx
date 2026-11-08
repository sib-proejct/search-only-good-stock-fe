import { describe, it, expect, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { StockMemoEditor } from './StockMemoEditor';

vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
}));

vi.mock('../../context/AccountContext', () => ({
  useAccount: () => ({
    user: { id: 1, username: 'admin', role: 'admin' },
  }),
}));

vi.mock('../../services/api', () => ({
  stockApi: {
    updateStockMemo: vi.fn(),
    deleteStockMemo: vi.fn(),
  },
}));

describe('StockMemoEditor static markup', () => {
  it('renders company name in normal mode', () => {
    const html = renderToStaticMarkup(
      <StockMemoEditor
        stockId="AAPL"
        stockName="Apple Inc."
        initialMemo="AI Ecosystem"
        isFavoritePage={false}
      />
    );
    expect(html).toContain('Apple Inc.');
    expect(html).not.toContain('AI Ecosystem');
  });

  it('renders memo instead of full company name in favorite mode when memo exists', () => {
    const html = renderToStaticMarkup(
      <StockMemoEditor
        stockId="AAPL"
        stockName="Apple Inc."
        initialMemo="AI Ecosystem"
        isFavoritePage={true}
      />
    );
    expect(html).toContain('AI Ecosystem');
    expect(html).toContain('title="Apple Inc. (클릭하여 메모 수정)"');
  });

  it('renders only memo add button without full company name in favorite mode when memo is empty', () => {
    const html = renderToStaticMarkup(
      <StockMemoEditor
        stockId="AAPL"
        stockName="Apple Inc."
        initialMemo={null}
        isFavoritePage={true}
      />
    );
    expect(html).not.toContain('<span class="truncate">Apple Inc.</span>');
    expect(html).toContain('title="Apple Inc. (클릭하여 메모 추가)"');
    expect(html).toContain('+ 메모');
  });

  it('defaults to memo editing mode without full company name when isFavoritePage is omitted', () => {
    const html = renderToStaticMarkup(
      <StockMemoEditor
        stockId="AAPL"
        stockName="Apple Inc."
        initialMemo="AI Ecosystem"
      />
    );
    expect(html).toContain('AI Ecosystem');
    expect(html).toContain('title="Apple Inc. (클릭하여 메모 수정)"');
  });
});
