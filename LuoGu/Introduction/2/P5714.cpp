#include <iostream>
#include <iomanip>

using std::cin;
using std::cout;
using std::endl;
using std::setprecision;

int main(void)
{
    double m, h;
    cin >> m >> h;
    
    double bmi = m / (h * h);
    
    if (bmi < 18.5) {
        cout << "Underweight" << endl;
    } else if (bmi < 24) {
        cout << "Normal" << endl;
    } else {
        cout << setprecision(6) << bmi << endl;
        cout << "Overweight" << endl;
    }
    return 0;
}
