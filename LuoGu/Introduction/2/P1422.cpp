#include <iostream>
#include <iomanip>

using std::cin;
using std::cout;
using std::endl;
using std::fixed;
using std::setprecision;

int main(void)
{
    int usage;
    cin >> usage;
    
    double fee = 0.0;
    
    if (usage <= 150) {
        fee = usage * 0.4463;
    } else if (usage <= 400) {
        fee = 150 * 0.4463 + (usage - 150) * 0.4663;
    } else {
        fee = 150 * 0.4463 + 250 * 0.4663 + (usage - 400) * 0.5663;
    }
    
    cout << fixed << setprecision(1) << fee << endl;
    
    return 0;
}