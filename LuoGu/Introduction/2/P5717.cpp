#include <iostream>
#include <algorithm>

using std::cin;
using std::cout;
using std::endl;
using std::sort;

int main(void)
{
    int a, b, c;
    cin >> a >> b >> c;
    
    int sides[3] = {a, b, c};
    sort(sides, sides + 3);
    
    int x = sides[0], y = sides[1], z = sides[2];

    if (x + y <= z) {
        cout << "Not triangle" << endl;
        return 0;
    }
    
    long long sum = (long long)x * x + (long long)y * y;
    long long zz = (long long)z * z;
    
    if (sum > zz) {
        cout << "Acute triangle" << endl;
    } else if (sum == zz) {
        cout << "Right triangle" << endl;
    } else {
        cout << "Obtuse triangle" << endl;
    }

    if (a == b || b == c || a == c) {
        cout << "Isosceles triangle" << endl;
    }

    if (a == b && b == c) {
        cout << "Equilateral triangle" << endl;
    }
    
    return 0;
}