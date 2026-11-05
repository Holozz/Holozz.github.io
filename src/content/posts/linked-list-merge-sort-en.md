---
title: "LeetCode 148: Merge Sort on a Linked List"
description: "Use my linked-list implementation to understand splitting, recursion, merging, midpoint selection, stability, and recursion space."
slug: linked-list-merge-sort
translationKey: linked-list-merge-sort
kind: articles
lang: en
pubDate: 2026-11-05
category: Algorithms
tags: [Linked Lists, Merge Sort, Divide and Conquer]
draft: false
---

## Start with merging two sorted lists

Two sorted lists can be merged in linear time by repeatedly selecting the smaller head node. Merge sort turns that operation into a complete sorting algorithm:

1. Split the input into two halves of nearly equal length.
2. Recursively sort each half.
3. Merge the sorted halves and return the new head.

For example, split `4 → 2 → 1 → 3` into `4 → 2` and `1 → 3`, then into individual nodes. A single node is already sorted, so merge upward:

```text
[4] + [2] → [2, 4]
[1] + [3] → [1, 3]
[2, 4] + [1, 3] → [1, 2, 3, 4]
```

The brackets only illustrate node order. The implementation changes `next` links rather than creating these arrays.

## My complete implementation

The original comparisons and pointer operations are preserved. `ListNode` is the node type supplied by the problem, with `val`, `next`, and the required constructors.

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

## 1. Split with slow and fast pointers

The slow pointer advances one node at a time, while the fast pointer advances two. Importantly, the fast pointer starts at `head.next`:

```java
ListNode slow = head, fast = head.next;
```

When the loop stops, `slow` is the last node of the left half. Even-length inputs split evenly; for odd lengths, the left half has one extra node.

For two nodes, `a → b`, the fast pointer starts at `b`, so the loop does not run. The slow pointer stays at `a`, allowing a split into two single-node lists. Starting both pointers at `head` without changing the remaining logic would instead leave `slow` at `b`. The left input would not shrink, preventing recursion from terminating normally.

Save the right head before cutting the link:

```java
ListNode neck = slow.next;
slow.next = null;
```

Without the cut, recursively processing `head` would still traverse the entire original list.

## 2. Recursion returns the new sorted head

Empty and single-node lists need no sorting:

```java
if(head == null || head.next == null) return head;
```

The two recursive calls sort the halves independently. Since sorting can change the head, capture their return values instead of assuming that `head` and `neck` still point to the sorted heads.

The recursive contract is simple: `sortList(x)` returns the sorted head of the list starting at `x`. The current call only needs to split and merge, rather than manage every deeper recursive step explicitly.

## 3. Merge using a dummy head

The dummy node `dum` avoids a special case for the first result node. The pointer `cur` always marks the tail of the merged portion. Attach the smaller remaining head, advance that input pointer, then advance `cur`.

The original nodes are reused rather than copied. When one input is exhausted, the remaining portion of the other list is already sorted and can be attached in one step:

```java
cur.next = list1 != null ? list1 : list2;
```

Return `dum.next`. The input halves are disjoint, and each step selects the smaller available head, so the merged output is sorted and contains every original node exactly once.

## Correctness and stability

The empty-list and single-node base cases are sorted. Assuming recursion correctly sorts both shorter halves, merging them produces a sorted version of the current list. Each split reduces the input size, so recursion terminates and sorts the whole list.

**The original code sorts correctly but does not guarantee stability.** For equal values, `list1.val < list2.val` is false, so the right-hand node is selected first. Two equal nodes originally ordered `2a → 2b` can therefore become `2b → 2a`.

If equal-valued nodes must keep their original relative order, use `list1.val <= list2.val`. Choosing the left node on ties makes the recursive merge sort stable. The complete listing above preserves my original version.

## Complexity and a possible optimization

Let $n$ be the node count. Across one recursion level, finding midpoints and merging take $O(n)$ time. The recursion has $O(\log n)$ levels, giving:

$$
T(n)=T(\lceil n/2\rceil)+T(\lfloor n/2\rfloor)+O(n)
$$

With base cases $T(0)=T(1)=O(1)$, total time is **$O(n\log n)$**.

The recursion stack takes **$O(\log n)$ auxiliary space**. Reusing list nodes does not make the recursive version constant-space. An individual merge only needs a constant number of pointers and one dummy node.

For constant auxiliary space, use bottom-up iterative merge sort: merge adjacent runs of length `1`, then `2, 4, 8, …`. Time remains $O(n\log n)$, but the recursion stack disappears. The implementation must explicitly split and reconnect runs, including a final run shorter than the requested length.

## Pitfalls at a glance

| Detail | What must hold |
| --- | --- |
| Initial fast pointer | This split logic starts it at `head.next`, ensuring that two nodes split properly |
| `slow.next = null` | Save the right head before disconnecting the halves |
| Recursive results | Use the returned heads rather than discarding them |
| Finishing the merge | Attach the nonempty remainder directly |
| Stability | Prefer the left half on ties by using `<=` |
| Space complexity | Include the $O(\log n)$ stack in the top-down version |

Merge sort suits linked lists because **splitting needs only a midpoint and a cut, while merging reconnects nodes without requiring array-style random access.**
