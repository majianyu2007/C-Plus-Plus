#include <iostream>
#include <algorithm>

using std::cin;
using std::cout;
using std::endl;
using std::sort;

long long gcd(long long a, long long b) {
    if (b == 0) return a;
    return gcd(b, a % b);
}

int main() {
    long long a, b, c;
    cin >> a >> b >> c;

    long long sides[3] = {a, b, c};
    sort(sides, sides + 3);
    
    long long numerator = sides[0];
    long long denominator = sides[2];

    long long g = gcd(numerator, denominator);
    numerator /= g;
    denominator /= g;
    
    cout << numerator << "/" << denominator << endl;
    
    return 0;
}