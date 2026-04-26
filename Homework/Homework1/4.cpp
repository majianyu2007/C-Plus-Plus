/*
4.  编写程序，计算e = 1+1/1!+1/2!+1/3!＋…＋1/n!＋…的近似值，要求误差小于0.00001。
*/
#include <iostream>

using std::cout;
using std::endl;

#define PRECISION 1e-5

int main(void)
{
    double result = 0.0;
    double factorial = 1.0;
    
    for (int n = 0; ; n++) {
        double term = 1.0 / factorial;
        
        if (term < PRECISION) {
            break;
        }
        
        result += term;
        factorial *= (n + 1);
    }
    
    cout << "e ≈ " << result << endl;
    
    return 0;
}
