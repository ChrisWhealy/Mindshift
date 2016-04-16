// Calculate the nth Fibonacci number: imperative style
function fibonacci(n) {  
  var a = 0, b = 1, sum = 0;
  while (n>1) {
    sum = a + b;
    a = b;
    b = sum;
    n = n - 1;
  }
  return sum;
}

