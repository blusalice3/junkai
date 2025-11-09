import { ShoppingItem } from '../types';

// サークル名・参加日・ブロック・ナンバー・タイトルで照合するキーを生成
export function getItemKey(item: ShoppingItem | Omit<ShoppingItem, 'id' | 'purchaseStatus'>): string {
  return `${item.circle}|${item.eventDate}|${item.block}|${item.number}|${item.title}`;
}

// サークル名・参加日・ブロック・ナンバーで照合するキー（タイトル変更時用）
export function getItemKeyWithoutTitle(item: ShoppingItem | Omit<ShoppingItem, 'id' | 'purchaseStatus'>): string {
  return `${item.circle}|${item.eventDate}|${item.block}|${item.number}`;
}

// 参加日・ブロック・ナンバーでソートして挿入位置を決定
export function insertItemSorted(items: ShoppingItem[], newItem: ShoppingItem): ShoppingItem[] {
  const newItems = [...items];
  const newItemKey = `${newItem.eventDate}|${newItem.block}|${newItem.number}`;
  
  // 同じ参加日のアイテムのみを対象にソート
  const sameDayItems = newItems.filter(item => item.eventDate === newItem.eventDate);
  const otherDayItems = newItems.filter(item => item.eventDate !== newItem.eventDate);
  
  let insertIndex = 0;
  for (let i = 0; i < sameDayItems.length; i++) {
    const currentKey = `${sameDayItems[i].eventDate}|${sameDayItems[i].block}|${sameDayItems[i].number}`;
    if (currentKey.localeCompare(newItemKey, 'ja', { numeric: true, sensitivity: 'base' }) > 0) {
      insertIndex = i;
      break;
    }
    insertIndex = i + 1;
  }
  
  // 同じ参加日のアイテムの開始位置を取得
  const sameDayStartIndex = newItems.findIndex(item => item.eventDate === newItem.eventDate);
  const actualInsertIndex = sameDayStartIndex === -1 ? newItems.length : sameDayStartIndex + insertIndex;
  
  newItems.splice(actualInsertIndex, 0, newItem);
  return newItems;
}
