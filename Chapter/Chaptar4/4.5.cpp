#include <iostream>
#include <cstring>
using namespace std;

int main() {
    char a[] = "Hello World";
    char b[20];
    int n = 5;
    
    for (int i = 0; i < n; i++) {
        b[i] = a[i];
    }
    b[n] = '\0';
    
    cout << "Original array a: " << a << endl;
    cout << "First " << n << " characters copied to b: " << b << endl;
    
    return 0;
}