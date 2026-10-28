---
title: "LeetCode 15: 3Sum"
description: "Build on Two Sum: fix one value, then use sorting and HashSet removal to avoid duplicate triplets."
slug: threesum
translationKey: threesum-zh
kind: articles
lang: en
pubDate: 2026-10-28
# updatedDate: 2026-10-28
category: Algorithms
tags: [Notes]
draft: false
---

## Starting from Two Sum

Given an integer array `nums`, find all triplets whose sum is `0`. The three elements must come from distinct indices, and the result must not contain duplicate value combinations.

My starting point was simple: if a hash set can solve Two Sum, can I reduce 3Sum to repeated Two Sum searches?

Once a value $a$ is fixed, the remaining values $b$ and $c$ must satisfy:

$$
b+c=-a
$$

The outer loop fixes `nums[i]`, and the inner search looks for pairs with target sum `-nums[i]` in the remaining suffix. The main questions become: **how do I keep the three indices distinct, and how do I avoid duplicate answers?**

## Sort first, then search only the suffix

Sort the entire array. After fixing `nums[i]`, pass only the elements after it to the Two Sum helper:

```java
int[] slice = Arrays.copyOfRange(nums, i + 1, nums.length);
res.addAll(twoSum(slice, -nums[i]));
```

The range used by `copyOfRange` includes its start and excludes its end. The current fixed element is therefore absent from `slice`, so the inner search cannot reuse its index.

For example, suppose the sorted array is:

```text
[-4, -1, -1, 0, 1, 2]
```

Fixing the `-1` at index `1` leaves `[-1, 0, 1, 2]`. Searching for pairs with sum `1` finds `[-1, 2]` and `[0, 1]`.

Equal values at different indices are allowed. After fixing the first `-1`, the second `-1` can still participate in the triplet `[-1, -1, 2]`.

## Inner deduplication: remove the smaller value after a match

Let `target` be the required pair sum and `v` the current value. Its complement is:

```java
int other = target - v;
```

Because the suffix is sorted, there are three cases.

### The current value is smaller than its complement

When `v < other`, the complement is larger and may appear later. Add `v` to the set so that a later element can match it.

Even if this smaller value occurs several times, `HashSet` stores it only once.

### The current value is larger than its complement

When `v > other`, the smaller complement, if present, must already have been visited. Look for it in the set. If it exists, record the answer and immediately remove `other`.

For example, with `target = 4` and suffix `[1, 1, 3, 3]`:

| Current value | Action | Set | New pair |
| --- | --- | --- | --- |
| First `1` | Add it to the set | `{1}` | None |
| Second `1` | Add it again; the set is unchanged | `{1}` | None |
| First `3` | Find and remove `1` | `{}` | `[1, 3]` |
| Second `3` | No `1` remains | `{}` | None |

**Sorting and removal work together to prevent duplicates.** After recording `[1, 3]`, no later element can be `1`, so the removed value cannot enter the set again.

Without sorting, a sequence such as `[1, 3, 1, 3]` would add the later `1` back to the set and produce the same pair twice. This helper therefore requires sorted input.

### The current value equals its complement

When `v == other`, the pair needs two equal values at different indices.

For `target = 4`, one `2` is insufficient: at least two occurrences are needed. However, `[2, 2, 2, 2]` must still produce the pair `[2, 2]` only once.

Count the elements satisfying `v == other` separately. After the scan, add one answer if the count is at least `2`.

In my original version, `flag++ == 0` incremented the counter whenever the values were equal. The implementation below makes that counting explicit and no longer inserts equal-case values into the set.

## Outer deduplication: skip repeated fixed values

Inner deduplication prevents repeated pairs within one `twoSum` call. Different outer-loop iterations can still produce the same triplet, so the outer loop also needs:

```java
if (i > 0 && nums[i] == nums[i - 1]) continue;
```

After sorting, equal fixed values are adjacent. The first occurrence has a suffix containing every element available to later occurrences of that same fixed value. Those later searches cannot introduce a new value combination.

This does not forbid repeated values within a triplet. For example, `[-1, -1, 2]` is found when the first `-1` is fixed.

## Complete Java implementation

This implementation keeps the original design: sort, copy the suffix, remove matched complements from the set, and count equal-value pairs separately. The helper returns triplets in `[v, other, -target]` order; the problem does not require the values within each triplet to be sorted.

```java
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

class Solution {
    // Precondition: nums is sorted in nondecreasing order.
    private List<List<Integer>> twoSum(int[] nums, int target) {
        List<List<Integer>> res = new ArrayList<>();
        Set<Integer> set = new HashSet<>();
        int equalCount = 0;

        for (int v : nums) {
            int other = target - v;

            if (v < other) {
                set.add(v);
            } else if (v > other) {
                // true means the complement existed and has been removed.
                if (set.remove(other)) {
                    res.add(Arrays.asList(v, other, -target));
                }
            } else {
                equalCount++;
            }
        }

        if (equalCount >= 2) {
            res.add(Arrays.asList(target / 2, target / 2, -target));
        }

        return res;
    }

    public List<List<Integer>> threeSum(int[] nums) {
        Arrays.sort(nums);
        List<List<Integer>> res = new ArrayList<>();

        for (int i = 0; i < nums.length - 2; i++) {
            if (i > 0 && nums[i] == nums[i - 1]) continue;

            int[] slice = Arrays.copyOfRange(nums, i + 1, nums.length);
            res.addAll(twoSum(slice, -nums[i]));
        }

        return res;
    }
}
```

`set.remove(other)` combines the existence check and deletion: it returns `true` if the value was removed, and `false` if the value was absent.

The integer arithmetic here assumes the problem's input range. Extending this code to arbitrary Java `int` values would require handling overflow in negation and subtraction.

## Why the algorithm finds every answer and uses distinct indices

Consider any valid triplet and order its values as $a\le b\le c$.

When the outer loop fixes $a$, the suffix retains the other two positions needed for that triplet. If $a$ occurs more than once, processing only its first occurrence is enough: that occurrence has the largest available suffix.

- If $b<c$, the inner scan encounters $b$ first and stores it. When $c$ is reached, it finds $b$ and records the answer. Removing $b$ prevents later copies of $c$ from matching it again.
- If $b=c$, the suffix contains at least two occurrences, and `equalCount >= 2` records the answer once.

For distinct pair values, the match uses two positions visited at different times. For equal pair values, at least two occurrences are required. The fixed outer position is excluded from the suffix. The three indices are therefore distinct.

## Complexity

Let $n$ be the original array length. Assuming hash-set insertion, lookup, and removal take $O(1)$ time on average:

- Sorting takes $O(n\log n)$ time.
- For each fixed element, copying and scanning the suffix both take time proportional to its length.
- The suffix lengths sum to $(n-1)+(n-2)+\cdots+2=O(n^2)$.

The overall expected time complexity is therefore **$O(n^2)$**.

Excluding the output, each iteration needs at most $O(n)$ space for the suffix array and the set, so peak auxiliary space is **$O(n)$**. If there are $k$ output triplets, space including the output is $O(n+k)$.

Copying a slice on every iteration does not change the asymptotic time bound, but it copies $O(n^2)$ array elements in total. A later refinement could pass the original array and a starting index to the helper, avoiding those copies while keeping the same deduplication logic.

## Edge cases and pitfalls

| Case | Expected result or handling |
| --- | --- |
| `[0, 0, 0, 0]` | Return `[0, 0, 0]` only once: skip repeated fixed values and add the equal-value pair once |
| `[-2, 1]` | No triplet; the single `1` cannot be used twice |
| `[-2, 1, 1]` | `[-2, 1, 1]` is valid because the two occurrences of `1` have different indices |
| `[-2, 0, 0, 2, 2]` | Return the value combination `[-2, 0, 2]` only once |
| The suffix is not sorted | Removing complements alone does not guarantee deduplication |
| The outer loop does not skip equal fixed values | Different helper calls can return the same triplet |

The key idea is to **use sorting to control when values can appear, remove smaller complements once their distinct-value pairs have been recorded, and handle equal-value pairs with a separate count.**
