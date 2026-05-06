# Sparse parity learning

We want to learn the parity of a substring of bits.

$ y = \prod_{j \in k} x_j $

This is a (n,k)-sparse parity. Random SGD would take $ 2^{O(n)} $ steps,
but real SGD takes $ n^{\Omega(k)} $ steps — polynomial.
