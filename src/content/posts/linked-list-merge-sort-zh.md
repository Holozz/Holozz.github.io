---
title: "lc148.排序链表：归并排序"
description: "以我的链表排序代码为例，理解归并排序的拆分、递归与合并，以及中点选择、稳定性和递归空间。"
slug: linked-list-merge-sort
translationKey: linked-list-merge-sort
kind: articles
lang: zh
pubDate: 2026-11-05
category: 算法
tags: [链表, 归并排序, 分治]
draft: false
---

## 从合并两个有序链表出发

如果两个链表已经有序，就可以比较各自头节点，反复接入较小的节点，线性时间内得到一个有序链表。归并排序把这个简单操作变成了完整的排序算法：

1. 把原链表拆成长度尽量接近的两半。
2. 递归地把两半分别排好序。
3. 合并两个有序链表，返回新的头节点。

例如，`4 → 2 → 1 → 3` 先拆成 `4 → 2` 和 `1 → 3`，再拆成单节点。单节点天然有序，然后逐层合并：

```text
[4] + [2] → [2, 4]
[1] + [3] → [1, 3]
[2, 4] + [1, 3] → [1, 2, 3, 4]
```

方括号仅用于展示节点顺序，实际实现只修改节点的 `next`，不创建这些数组。

## 我的完整代码

保留原来的比较条件与指针写法。这里的 `ListNode` 使用题目提供的节点类型，包含 `val`、`next` 以及相应构造方法。

```java
class Solution {
    public ListNode merge(ListNode list1, ListNode list2) {
        ListNode dum = new ListNode(0), cur = dum;
        while (list1 != null && list2 != null) {
            if (list1.val < list2.val) {
                cur.next = list1;
                list1 = list1.next;
            }
            else {
                cur.next = list2;
                list2 = list2.next;
            }
            cur = cur.next;
        }
        cur.next = list1 != null ? list1 : list2;
        return dum.next;
    }
    public ListNode sortList(ListNode head) {
        if(head == null || head.next == null) return head;

        ListNode slow = head, fast = head.next;
        while(fast != null && fast.next != null){
            slow = slow.next;
            fast = fast.next.next;
        }
        ListNode neck = slow.next;
        slow.next = null;
        ListNode sortedHead = sortList(head);
        ListNode sortedNeck = sortList(neck);

        return merge(sortedHead, sortedNeck);
    }
}
```

## 1. 用快慢指针拆成两半

`slow` 每次走一步，`fast` 每次走两步。这里特别让 `fast` 从 `head.next` 出发：

```java
ListNode slow = head, fast = head.next;
```

循环结束时，`slow` 是左半部分的尾节点。偶数个节点时左右等长；奇数个节点时左半部分多一个。

对于两个节点 `a → b`，快指针从 `b` 出发，循环不会执行，`slow` 留在 `a`，刚好可以拆成两个单节点。如果改成快慢指针都从 `head` 出发、却保留其他代码，`slow` 会走到 `b`，左半部分没有缩小，递归就不能正常结束。

接着先保存右半部分头节点，再断开连接：

```java
ListNode neck = slow.next;
slow.next = null;
```

不能省掉断链。否则递归处理 `head` 时仍会沿着原来的连接访问整条链表。

## 2. 递归返回“已经排好序的新头节点”

空链表和单节点无需排序：

```java
if(head == null || head.next == null) return head;
```

拆分后，两次递归分别处理两半。排序会改变头节点，所以必须接收返回值，而不能继续假设原来的 `head`、`neck` 仍是排序后的头。

递归可以理解为一个约定：调用 `sortList(x)`，就会得到从 `x` 开始的这一段链表排好序后的头节点。当前层只负责拆分和合并，不需要手动管理更深层的所有节点。

## 3. 用虚拟头节点合并

`dum` 是虚拟头节点，`cur` 始终指向已经合并部分的尾节点。每次选择较小的头节点，接到 `cur.next`，然后移动对应输入指针与 `cur`。

这里复用的是原节点，不是复制节点的值。一个链表耗尽后，另一条链表的剩余部分本来就有序，可以整段接上：

```java
cur.next = list1 != null ? list1 : list2;
```

返回 `dum.next`，避免单独判断“第一个节点应该选谁”。因为两个输入链表已经被拆开，且每次都接入剩余部分中较小的头节点，所以合并结果有序，并且每个原节点恰好出现一次。

## 正确性与稳定性

单节点和空链表显然有序。假设两次递归已经正确排序了较短的链表，那么有序合并会产生当前整段的有序链表。拆分后的长度持续减小，因此递归最终结束，得到整条链表的排序结果。

**原代码能正确排序，但不保证稳定性。**相等时 `list1.val < list2.val` 为假，会先取右半部分的节点。例如两个等值节点原来按 `2a → 2b` 排列，合并时可能变成 `2b → 2a`。

如果要求相等值保持原有相对顺序，把比较改为 `list1.val <= list2.val` 即可。相等时优先取左边，配合递归合并就能保证稳定性；正文完整代码仍保留我的原版。

## 复杂度与优化方向

设节点数为 $n$。每层拆分找中点和合并总共需要 $O(n)$ 时间，拆分深度是 $O(\log n)$。对应递推式为：

$$
T(n)=T(\lceil n/2\rceil)+T(\lfloor n/2\rfloor)+O(n)
$$

初始条件为 $T(0)=T(1)=O(1)$，所以总时间为 **$O(n\log n)$**。

递归栈占 **$O(\log n)$ 辅助空间**。虽然合并复用了原节点，但不能忽略递归栈而写成 $O(1)$。合并函数本身只需要常数个指针和一个虚拟节点。

如果要求常数辅助空间，可以使用自底向上的迭代归并：先合并长度为 `1` 的相邻段，再合并长度为 `2、4、8……` 的段。它仍然是 $O(n\log n)$ 时间，但省掉了递归栈；代价是需要更明确地处理每段的断开、连接以及最后一段不足长度的情况。

## 易错点速查

| 位置 | 需要保证什么 |
| --- | --- |
| 快指针初值 | 当前拆分写法使用 `head.next`，确保两个节点也能真正分开 |
| `slow.next = null` | 先保存右半部分头节点，再断链 |
| 递归结果 | 使用返回的新头节点，不能只调用而忽略返回值 |
| 合并收尾 | 把未耗尽的一侧直接接到结果尾部 |
| 稳定性 | 相等时优先取左半部分，即使用 `<=` |
| 空间复杂度 | 自顶向下版本要计算 $O(\log n)$ 递归栈 |

归并排序在链表上的优势是：**分解只需要找到中点并断链，合并只需要重新连接节点，不依赖数组式的随机访问。**
