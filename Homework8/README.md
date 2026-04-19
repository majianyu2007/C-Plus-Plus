#### 第8次作业
1.  修改第四次作业的有理数类CRational，要求实现下列运算符的重载：
(1) 用两个整数的比描述有理数;
(2) 重载"+"、"-"、" * "、"/"等双目运算符;
(3) 重载输出流运算符"<<"以分数形式输出有理数;
(4) 重载输入流运算符“>>”读入有理数;
(5) 重载"++"前缀、"++"后缀、"+(正号)"、"-(负号)"等单目运算符;
(6) 重载">"、"<"等运算符用于判断两个数的大小;
(7) 合理的初始化，注意检测分母和除数为0的错误，默认分子为0，分母为1。
实现有理数类并测试，测试代码如下：
```cpp
int main()
{
    CRational r1;
    CRational r2(2, 1);
    CRational r3(-3, -4);
    CRational r4(3, -9);
    CRational r5;
    r1 = 3.6;
    r5 = -r4;
    r4++;
    ++r4;
    cout<<"r1: "<<r1<<endl;
    cout<<"r2: "<<r2<<endl;
    cout<<"r3: "<<r3<<endl;
    cout<<"r4: "<<r4<<endl;
    cout<<"r5: "<<r5<<endl;
    if (r4>r2)
         cout << "r4>r2" << endl;
    else
        cout <<"r4<r2" << endl;
    cout<<"r2+r3: "<<(r2+r3)<<endl;
    cout<<"r2-r3: "<<(r2-r3)<<endl;
    cout<<"r2*r3: "<<(r2*r3)<<endl;
    cout<<"r2/r3: "<<(r2/r3)<<endl;
    cout<<"r4+r3: "<<(r4+r3)<<endl;
    cout<<"r4-r3: "<<(r4-r3)<<endl;
    cout<<"r4*r3: "<<(r4*r3)<<endl;
    cout<<"r4/r3: "<<(r4/r3)<<endl;

    return 0;
}
```
