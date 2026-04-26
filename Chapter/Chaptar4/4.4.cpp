#include <iostream>
#include <cmath>
using namespace std;

// Method 1: Using logarithm
bool isPowerOf2_Method1(int n) {
    if (n <= 0) return false;
    double result = log2(n);
    return result == floor(result);
}

// Method 2: Using bitwise operation
bool isPowerOf2_Method2(int n) {
    if (n <= 0) return false;
    return (n & (n - 1)) == 0;
}

int main() {
    int numbers[] = {4, 8, 64, 256};
    
    cout << "Method 1 (Logarithm):" << endl;
    for (int num : numbers) {
        cout << num << " is power of 2: " << (isPowerOf2_Method1(num) ? "yes" : "no") << endl;
    }
    
    cout << "\nMethod 2 (Bitwise):" << endl;
    for (int num : numbers) {
        cout << num << " is power of 2: " << (isPowerOf2_Method2(num) ? "yes" : "no") << endl;
    }
    
    cout << "\nComparison: Method 2 (bitwise) is more efficient." << endl;
    
    return 0;
}