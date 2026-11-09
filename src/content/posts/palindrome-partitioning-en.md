---
title: "LeetCode 131: Palindrome Partitioning and Backtracking"
description: "Trace the partitions of aab to understand palindrome preprocessing, recursive calls, shared-path restoration, and why completed answers must be copied."
slug: palindrome-partitioning
translationKey: palindrome-partitioning
kind: articles
lang: en
pubDate: 2026-11-09
category: Algorithms
tags: [Backtracking, Recursion, Dynamic Programming]
draft: false
---

## Each call chooses only the next piece

Given a string `s`, split it into nonempty substrings so that every piece is a palindrome, and return all possible partitions. For `"aab"`, the answers are:

```text
[["a", "a", "b"], ["aa", "b"]]
```

The difficult part for me was understanding the recursion: what does each call do, where does its parent wait, and why must a selected substring be removed after returning?

Start with a precise contract: **on entry to `dfs(s, i)`, `ans` is a valid partition of the first `i` characters. This call enumerates partitions of the remaining suffix and restores `ans` to its entry state before returning.**

The current call chooses only the next endpoint `j`. If `s[i...j]` is a palindrome, it adds that piece to the path and lets the next call handle the suffix starting at `j + 1`.

## A character index is not the recursion depth

The parameter `i` is indeed a character index: it marks the start of the unprocessed suffix. Recursion depth measures the number of pieces already chosen.

| Pieces already chosen | Recursion depth, root at 0 | Next call's `i` |
| --- | --- | --- |
| None | `0` | `0` |
| `"a"` | `1` | `1` |
| `"aa"` | `1` | `2` |
| `"a"`, `"a"` | `2` | `2` |

Each recursive step adds one piece, but that piece may contain several characters. The next position is therefore `j + 1`, not necessarily `i + 1`.

## Precompute which intervals are palindromes

Let `f[i][j]` indicate whether the inclusive interval `s[i...j]` is a palindrome. Its endpoints must match, and its interior must also be a palindrome:

$$
f[i][j]=(s[i]=s[j])\land f[i+1][j-1]
$$

The code initializes the entire table to `true`, then computes only entries with `i < j`:

```java
for (int i = 0; i < n; ++i) {
    Arrays.fill(f[i], true);
}
for (int i = n - 1; i >= 0; --i) {
    for (int j = i + 1; j < n; ++j) {
        f[i][j] = (s.charAt(i) == s.charAt(j)) && f[i + 1][j - 1];
    }
}
```

The initialization handles the base cases:

- `f[i][i]` remains `true`: a single character is a palindrome.
- A two-character interval reads `f[i + 1][i]`. This lower-triangle entry represents an empty interior and is `true`, leaving only the endpoint comparison.
- All other valid intervals are overwritten by the recurrence. Initialization does not declare every substring a palindrome.

The outer loop processes `i` in descending order because the current entry depends on `f[i + 1][j - 1]` in the next row. Preprocessing takes $O(n^2)$ time and space, after which each candidate interval can be checked in $O(1)$ time.

## Choose, recurse, undo

These three lines are the core of backtracking:

```java
ans.add(s.substring(i, j + 1));
dfs(s, j + 1);
ans.remove(ans.size() - 1);
```

1. **Choose:** append the palindrome `s[i...j]`. Java's `substring` excludes its end argument, so the argument is `j + 1`.
2. **Recurse:** suspend the current call while the child enumerates every valid partition of the remaining suffix.
3. **Undo:** after the child returns, resume at the next statement, remove the piece chosen by this call, and try another endpoint.

It helps to separate local state from shared state:

| State | Relationship between calls |
| --- | --- |
| Parameter `i` and loop variable `j` | Each call has its own values; a child does not overwrite the parent's local variables |
| Field `ans` | Every call shares this list, adding and removing pieces along the current search path |
| Field `ret` | Stores completed partitions; answers are not undone during backtracking |
| `f` and `n` | Shared and read-only during the search |

Returning from recursion does not restart the parent method or end its loop. The parent remembers its own `j`, undoes its choice, and continues with the next endpoint.

## Trace entry and return with aab

The tree below shows palindrome choices; non-palindromic candidates are skipped.

```text
dfs(0), ans = []
├─ Choose "a": dfs(1), ans = ["a"]
│  ├─ Choose "a": dfs(2), ans = ["a", "a"]
│  │  └─ Choose "b": dfs(3), save ["a", "a", "b"]
│  └─ "ab" is not a palindrome: skip
├─ Choose "aa": dfs(2), ans = ["aa"]
│  └─ Choose "b": dfs(3), save ["aa", "b"]
└─ "aab" is not a palindrome: skip
```

The return order along the first branch is especially useful to follow:

1. `dfs(3)` reaches `i == n`, saves the answer, and returns immediately.
2. Execution resumes after the recursive call inside `dfs(2)`. Removing `"b"` restores the path to `["a", "a"]`.
3. The loop in `dfs(2)` ends, returning to `dfs(1)`. That call removes its own choice, the second `"a"`, restoring `["a"]`.
4. `dfs(1)` tries and skips `"ab"`, then returns. The root removes the first `"a"`, restoring `[]`.
5. The root continues with the next endpoint and chooses `"aa"` to explore another branch.

A child undoes the choices it makes, including those made by deeper calls. The parent undoes the choice it made before entering that child. Each `add` is paired with a `remove` in the same call.

## Why completed answers must be copied

```java
if (i == n) {
    ret.add(new ArrayList<String>(ans));
    return;
}
```

Reaching `i == n` means every character has been covered, so the current path is a complete valid partition.

Using `ret.add(ans)` would store a reference to the shared list. Later removals would also change the supposedly saved answer. `new ArrayList<>(ans)` creates an independent list that survives subsequent path changes.

Only the list itself needs copying. Its `String` elements are immutable and can safely be shared.

## Complete Java code

This preserves the discussed fields, palindrome-table initialization, and backtracking structure, with the imports included.

```java
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

class Solution {
    boolean[][] f;
    List<List<String>> ret = new ArrayList<List<String>>();
    List<String> ans = new ArrayList<String>();
    int n;

    public List<List<String>> partition(String s) {
        n = s.length();
        f = new boolean[n][n];
        for (int i = 0; i < n; ++i) {
            Arrays.fill(f[i], true);
        }

        for (int i = n - 1; i >= 0; --i) {
            for (int j = i + 1; j < n; ++j) {
                f[i][j] = (s.charAt(i) == s.charAt(j)) && f[i + 1][j - 1];
            }
        }

        dfs(s, 0);
        return ret;
    }

    public void dfs(String s, int i) {
        if (i == n) {
            ret.add(new ArrayList<String>(ans));
            return;
        }
        for (int j = i; j < n; ++j) {
            if (f[i][j]) {
                ans.add(s.substring(i, j + 1));
                dfs(s, j + 1);
                ans.remove(ans.size() - 1);
            }
        }
    }
}
```

This version is intended for a single solve per instance. Calling `partition` repeatedly on the same `Solution` object accumulates old answers in the field `ret`; reinitialize the result list before each solve if reusing the object. Normal completion of backtracking leaves `ans` empty.

## Why every partition is found exactly once

**Validity:** an interval is selected only when `f[i][j]` is true. The next call starts at `j + 1`, so pieces are adjacent with no overlap or gaps. Reaching `n` means they cover the entire string.

**Completeness:** every valid partition has a particular endpoint for its first piece. The loop tries that endpoint, and recursion then tries the endpoint of its second piece, continuing until the full partition is reached.

**Uniqueness:** a partition has a unique sequence of endpoints. Each call tries each endpoint only once, so the same partition cannot be produced twice. No additional deduplication set is needed.

## Why the complexity is exponential

A string of length $n\ge1$ has $n-1$ gaps between characters. Each gap can be cut or left uncut. For `"aaaa..."`, every substring is a palindrome, so every cut pattern is valid: there are exactly $2^{n-1}$ partitions.

| Component | Time or space |
| --- | --- |
| Palindrome preprocessing | $O(n^2)$ time and $O(n^2)$ space |
| Searching and saving all partitions | Worst-case $O(n2^n)$ time, including path copies and Java substring creation |
| Recursion stack and current path | $O(n)$ auxiliary space |
| All answers | Worst-case $O(n2^n)$ space, including result lists and string storage |

Total time is $O(n^2+n2^n)$, usually written as **$O(n2^n)$**. Auxiliary space excluding the output is **$O(n^2)$**. Preprocessing speeds up palindrome checks, but cannot make explicit enumeration polynomial when the number of answers can itself be exponential.

## Examples and pitfalls

These small examples check the cut patterns and boundary cases:

| Input | All partitions | Explanation |
| --- | --- | --- |
| `"aab"` | `["a", "a", "b"]`, `["aa", "b"]` | `"ab"` and `"aab"` are pruned |
| `"aaa"` | `["a", "a", "a"]`, `["a", "aa"]`, `["aa", "a"]`, `["aaa"]` | Two gaps, each cut or uncut, give four partitions |
| `"abc"` | `["a", "b", "c"]` | Every candidate longer than one character fails the palindrome check |

| Misconception | Correct interpretation |
| --- | --- |
| The next call always handles the next character | It handles the next piece, starting at the current endpoint plus one |
| `i` is the recursion depth | `i` counts covered characters; depth counts chosen pieces |
| A child return restarts the parent | The parent resumes after the call with its own `i` and `j` intact |
| The shared path restores itself on return | Explicitly remove the current call's choice from `ans` |
| Saving `ans` in `ret` protects it from later changes | Save a copy of the path rather than the same list reference |

When following this kind of backtracking, track four things: **which suffix the call handles, which piece it chooses, where the child starts, and which choice it undoes after returning.**
