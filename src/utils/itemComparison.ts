import { ShoppingItem } from '../types';

// アイテムの一意キーを生成（照合用）
export function getItemKey(item: Pick<ShoppingItem, 'circle' | 'eventDate' | 'block' | 'number'>): string {
  return `${item.circle}|${item.eventDate}|${item.block}|${item.number}`;
}

// タイトルなしの簡易キー（タイトル変更対応）
export function getItemKeyWithoutTitle(item: Pick<ShoppingItem, 'circle' | 'eventDate' | 'block' | 'number'>): string {
  return getItemKey(item);
}

// ブロック名の正規化とソートキー生成
export function getBlockSortKey(block: string): string {
  if (!block) return '';
  
  // 半濁音の処理: パ→ハの後、ピ→ヒの後...
  const handakuMap: Record<string, string> = {
    'パ': 'ハ゛', 'ピ': 'ヒ゛', 'プ': 'フ゛', 'ペ': 'ヘ゛', 'ポ': 'ホ゛'
  };
  
  let normalized = '';
  for (const char of block) {
    if (handakuMap[char]) {
      normalized += handakuMap[char];
    } else {
      normalized += char;
    }
  }
  
  return normalized;
}

// ナンバーのソートキー生成
export function getNumberSortKey(number: string): string {
  if (!number) return '';
  
  // 数字部分と文字部分を分離
  const match = number.match(/^([0-9]+)([a-zA-Z]*)$/);
  if (match) {
    const numPart = match[1].padStart(10, '0'); // 数字を10桁にパディング
    const alphaPart = match[2] || '';
    return `${numPart}${alphaPart}`;
  }
  
  return number;
}

// ブロック名の比較（アルファベット大文字 → 小文字 → ひらがな → カタカナ）
export function compareBlocks(a: string, b: string): number {
  if (!a && !b) return 0;
  if (!a) return 1;
  if (!b) return -1;
  
  const getBlockOrder = (block: string): number => {
    const firstChar = block.charAt(0);
    if (/[A-Z]/.test(firstChar)) return 1; // 大文字アルファベット
    if (/[a-z]/.test(firstChar)) return 2; // 小文字アルファベット
    if (/[ぁ-ん]/.test(firstChar)) return 3; // ひらがな
    if (/[ァ-ヶ]/.test(firstChar)) return 4; // カタカナ
    return 5; // その他
  };
  
  const orderA = getBlockOrder(a);
  const orderB = getBlockOrder(b);
  
  if (orderA !== orderB) {
    return orderA - orderB;
  }
  
  // 同じカテゴリ内では正規化したキーで比較
  const keyA = getBlockSortKey(a);
  const keyB = getBlockSortKey(b);
  
  return keyA.localeCompare(keyB, 'ja', { sensitivity: 'base' });
}

// アイテムの完全な比較（ソート用）
export function compareItems(a: ShoppingItem, b: ShoppingItem): number {
  // 1. 参加日で比較
  const dateCompare = a.eventDate.localeCompare(b.eventDate, 'ja');
  if (dateCompare !== 0) return dateCompare;
  
  // 2. ブロックで比較
  const blockCompare = compareBlocks(a.block, b.block);
  if (blockCompare !== 0) return blockCompare;
  
  // 3. ナンバーで比較
  const numKeyA = getNumberSortKey(a.number);
  const numKeyB = getNumberSortKey(b.number);
  return numKeyA.localeCompare(numKeyB, undefined, { numeric: true, sensitivity: 'base' });
}

// 新規アイテムを既存リストの適切な位置に挿入
export function insertItemSorted(existingItems: ShoppingItem[], newItem: ShoppingItem): ShoppingItem[] {
  const result = [...existingItems];
  
  // 挿入位置を探す
  let insertIndex = result.length; // デフォルトは末尾
  
  for (let i = 0; i < result.length; i++) {
    if (compareItems(newItem, result[i]) < 0) {
      insertIndex = i;
      break;
    }
  }
  
  result.splice(insertIndex, 0, newItem);
  return result;
}
