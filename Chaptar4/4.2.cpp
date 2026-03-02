#include <iostream>

using std::cin;
using std::cout;
using std::endl;

int main(void)
{
    int digit{0}, alpha{0}, other{0};
    char ch;
    cout << "输入字符串，输入 \# 停止";
    do
    {
        cin >> ch;
        if (isalpha(ch)) 
            alpha++;
        else if (isdigit(ch))
            digit++;
        else
            other++;
    } while (ch != '#');

    cout << "字母个数：" << alpha << " 数字个数：" << digit << " 其他字符个数：" << other << endl;

    return 0;
}