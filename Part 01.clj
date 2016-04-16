(ns org.langram.mindshift)

(defn fib-step [[a b]] [b (+ a b)])
(def fib-seq (map first (iterate fib-step [0 1])))

(nth fib-seq 10)
(take 20 fib-seq)  
