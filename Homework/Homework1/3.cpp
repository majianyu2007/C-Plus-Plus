/*
3.  编写程序，随机产生一个1～12的整数，根据数值显示相应的英文月份名。例如生成的数为3时显示March。  
注：生成随机数的库函数为rand()，返回一个0~RAND_MAX之间的int值，要包含标准库＜cstdlib＞。RAND_MAX是库中定义的常量，值最小为32767。例如，生成10以内的随机数代码为rand()%10。
*/
#include <iostream>
#include <cstdlib>
#include <ctime>
#include <string>

using std::cout;
using std::endl;
using std::rand;
using std::srand;
using std::string;
using std::time;

int main(void)
{
    
    srand(static_cast<unsigned>(time(nullptr)));
    const string months[] = {
        "January","February","March","April","May","June",
        "July","August","September","October","November","December"
    };
    int n = rand() % 12 + 1;
    cout << months[n - 1] << endl;

    return 0;
}