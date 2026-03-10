#include <iostream>
#include <cmath>
#include <iomanip>

using namespace std;

int main(void) 
{
    int n;
    cin >> n;
    
    double sqrt5 = sqrt(5);
    double phi = (1 + sqrt5) / 2;
    double psi = (1 - sqrt5) / 2;
    
    double fn = (pow(phi, n) - pow(psi, n)) / sqrt5;
    
    cout << fixed << setprecision(2) << fn << endl;
    
    return 0;
}