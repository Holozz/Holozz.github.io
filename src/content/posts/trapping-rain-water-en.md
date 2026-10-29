---
title: "LeetCode 42: Trapping Rain Water"
description: "My two attempts: find boundaries with a monotonic stack and count water over intervals, then use running maxima for an O(1)-space two-pointer solution."
slug: trapping-rain-water
translationKey: trapping-rain-water
kind: articles
lang: en
pubDate: 2026-10-29
category: Algorithms
tags: [Monotonic Stack, Two Pointers]
draft: false
---
## First determine how much water each column holds

LeetCode 42 gives a nonnegative integer array `height`. Every bar has width `1`, and the task is to calculate how much rainwater can be trapped.

For index `i`, let $L_i$ be the maximum height on its left, including the current bar, and $R_i$ the maximum on its right, also including the current bar. The water above that position is:

$$
w_i=\min(L_i,R_i)-height[i]
$$

Both maxima include the current bar, so the difference is nonnegative. Sum these amounts over the array to obtain the total.

For `[2, 0, 2]`, both sides of the middle position have a maximum height of `2`, so it holds `2` units of water. The rule concerns the tallest available boundaries on either side, rather than just the two immediately adjacent bars.

My two attempts approach this rule differently: first identify the boundaries of a whole interval, or directly determine the water level of one column.

## First attempt: preserve boundaries in a stack and count an entire interval

My initial idea was to store bar indices in a stack. When a taller bar arrives on the right, pop lower intermediate bars, identify usable boundaries, and scan the entire interval between them.

For boundary indices `l` and `r`, take $H=\min(height[l],height[r])$ and try to sum $\max(H-height[i],0)$ over the interval.

However, merely finding two endpoints does not justify settling a whole interval at that level. The boundary selection rules must also ensure that water at a higher level is not missed and that the same region is not counted twice.

### My original code

**The following is my first draft, reproduced unchanged. It contains mistakes involving indices, heights, and boundary handling, so it is not a correct submission.** It is retained to document the approach and the issues that need fixing.

```java
import java.util.Deque;
import java.util.ArrayDeque;

class Solution {
    private int calVolume(int l, int r, int[] height){
        int res = 0;
        int H = Math.min(l, r);
        for(int i=l; i<=r; i++){
            res += Math.max(H - height[i], 0);
        }
        return res;
    }
    public int trap(int[] height) {
        Deque<Integer> dq = new ArrayDeque<>();
        int res = 0;
        for(int i=0; i<height.length; i++){
            if(dq.isEmpty() || dq.peek()>=height[i]) dq.push(i);
            else if(dq.peek() < height[i]){
                dq.pop();
                while(!dq.isEmpty()){
                    if(dq.peek()<=height[i]){
                        if(dq.size() == 1){
                            int left = dq.pop();
                            res += calVolume(left, i, height);
                            dq.push(i);
                            break;
                        }
                        else dq.pop();
                    }
                    else{
                        dq.push(i);
                        break;
                    }
                }
            }
        }
        while(dq.size() >= 2){
            int right = dq.pop();
            int left = dq.peek();
            res += calVolume(right, left, height);
        }
        return res;
    }
}
```

### What is wrong with the draft

| Original expression or operation                      | Issue and correction needed                                                                                       |
| ----------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| Comparisons such as `dq.peek() >= height[i]`        | The stack stores indices; use `height[dq.peek()]` to compare heights                                            |
| `Math.min(l, r)`                                    | The water level depends on boundary heights, so use `Math.min(height[l], height[r])`                            |
| Calling `dq.pop()` before `while (!dq.isEmpty())` | If that first pop empties the stack, the current index is never pushed; every path must preserve the current bar  |
| `calVolume(right, left, height)`                    | The right index is larger, so the arguments are reversed and the interval loop never runs; pass left before right |

For example, `[2, 0, 2]` should return `2`, but this draft returns `0`. When `calVolume(0, 2, height)` is called, it incorrectly takes the smaller index, `0`, as the water level.

### How this relates to the usual monotonic-stack solution

Both approaches use a monotonic stack to maintain potential boundaries. In the usual implementation, a popped low bar becomes the bottom of a layer, whose water is calculated immediately:

$$
\bigl(\min(height[left],height[right])-height[bottom]\bigr)
\times(right-left-1)
$$

My approach postpones the calculation until the interval boundaries are known, then counts water column by column within that interval. One method counts layers; the other counts columns within settled intervals.

A correctly repaired interval version can settle a whole interval when the current bar exceeds every pending boundary, then reuse the current bar as the next interval's starting boundary. After traversal, it can settle the intervals between adjacent remaining boundaries. These intervals overlap only at their endpoints, so their interiors are not scanned repeatedly. The design can therefore achieve $O(n)$ time and $O(n)$ auxiliary space.

This describes the repaired design, not a claim that the original draft above already implements those rules correctly. I then moved to a two-pointer approach with less state.

## Second attempt: compare the maximum heights already known on both sides

Instead of identifying a whole interval first, determine which current column already has enough information to calculate its water.

Maintain pointers `l` and `r`, along with two maxima:

- `lmax` is the maximum of `height[0..l]`, including the current left endpoint.
- `rmax` is the maximum of `height[r..n-1]`, including the current right endpoint.

If `lmax < rmax`, there is already a right boundary at least as high as `rmax` for position `l`. Finding an even taller bar inside the unprocessed region would not change the fact that this column is limited by `lmax`. Its water is therefore known:

$$
w_l=lmax-height[l]
$$

Then advance the left pointer and include the new position in `lmax`.

If `lmax >= rmax`, the same reasoning determines the right column's water as $rmax-height[r]$ before advancing the right pointer. When the maxima are equal, either side can be processed; my code chooses the right.

### My two-pointer code

The second version is reproduced unchanged below. It is correct under the problem's nonempty-array constraint.

```java
class Solution {
    public int trap(int[] height) {
        int res = 0;
        int l=0, r=height.length-1;
        int lmax=height[l], rmax=height[r];
        while(l < r){
            if(lmax < rmax){
                res += lmax - height[l];
                lmax = Math.max(lmax, height[++l]);
            }
            else{
                res += rmax - height[r];
                rmax = Math.max(rmax, height[--r]);
            }
        }

        return res;
    }
}
```

## Details that initially raised questions

### Why Math.max(..., 0) is unnecessary

At the start of each iteration, `lmax` already includes `height[l]`, and `rmax` already includes `height[r]`. Neither subtraction can be negative.

This depends on the update order: calculate the current column, advance its pointer, and immediately incorporate the new bar into that side's maximum.

For example, `height[++l]` increments `l` before accessing the new position. That line both moves the pointer and prepares the state for the next iteration.

### Why compare running maxima instead of only the current bar heights

In this implementation, `lmax` and `rmax` determine which side can be settled. They summarize the boundaries already found. Even if a current bar is low, an earlier encountered tall bar on that side may still provide the relevant boundary.

The proof therefore follows the meaning of those running maxima. Changing only the comparison condition requires rechecking whether the state definitions and the column being calculated still fit together.

### Does stopping when the pointers meet miss any water

No. Advancing the side with the smaller running maximum eventually makes the pointers meet at a globally tallest bar.

Once the left pointer reaches a globally tallest bar, `lmax` cannot be smaller than `rmax`, so the left pointer stays there while the right pointer approaches. If the right side reaches such a bar first, the left side is processed until it also reaches a globally tallest bar or the pointers meet.

A globally tallest bar cannot hold water above itself. Leaving the meeting position unprocessed therefore loses no water.

## Walking through [3, 0, 2, 0, 4]

Initially, `l = 0`, `r = 4`, `lmax = 3`, and `rmax = 4`.

| Current positions | `lmax` | `rmax` | Column processed         | Added water | Total |
| ----------------- | -------- | -------- | ------------------------ | ----------- | ----- |
| `l=0, r=4`      | `3`    | `4`    | Left bar of height `3` | `0`       | `0` |
| `l=1, r=4`      | `3`    | `4`    | Left bar of height `0` | `3`       | `3` |
| `l=2, r=4`      | `3`    | `4`    | Left bar of height `2` | `1`       | `4` |
| `l=3, r=4`      | `3`    | `4`    | Left bar of height `0` | `3`       | `7` |

The left pointer then moves to index `4`, where the pointers meet, and the method returns `7`. The last unprocessed bar has height `4`, the global maximum, so it holds no water above itself.

## Complexity and tradeoffs

Let $n$ be the array length.

| Approach                           | How water is counted                                   | Time     | Auxiliary space |
| ---------------------------------- | ------------------------------------------------------ | -------- | --------------- |
| Repaired stack-and-interval design | Settle boundaries, then scan nonoverlapping intervals  | $O(n)$ | $O(n)$        |
| Usual monotonic stack              | Count a layer when its bottom is popped                | $O(n)$ | $O(n)$        |
| My second, two-pointer version     | Compare running maxima and settle one column at a time | $O(n)$ | $O(1)$        |

The original first draft has correctness errors. A linear-time design goal does not make that code a correct solution.

The two-pointer version moves exactly one pointer per iteration, for at most $n-1$ iterations, and maintains only a few integers. It therefore takes $O(n)$ time and $O(1)$ auxiliary space. Relative to the stack design, its main improvement is less state and less memory; the asymptotic time bound is unchanged.

## Pitfalls at a glance

| Potential confusion                           | What to check                                                                                                              |
| --------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| Does the stack store heights or indices?      | If it stores indices, access the height through `height[dq.peek()]`                                                      |
| Water level for an interval                   | Compare the boundary heights, not their indices                                                                            |
| Losing the current bar after popping          | Make sure the current index is preserved even when popping empties the stack                                               |
| Special water handling at the array endpoints | Unnecessary: each endpoint limits its own water level, so its water is `0`                                               |
| Can the two-pointer subtraction be negative?  | Not here: each running maximum includes the current bar                                                                    |
| `lmax == rmax`                              | Either side can be settled; this code processes the right side                                                             |
| Empty array                                   | The original two-pointer code would access an invalid index; it is used here under the problem's nonempty-input constraint |

Both attempts follow the same fact: **a column's water level is limited by the lower of its two boundaries. The stack approach first identifies an interval that can be settled; the two-pointer approach uses a sufficiently tall known boundary on the opposite side to settle one column immediately.**
