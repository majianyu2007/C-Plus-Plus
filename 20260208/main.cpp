#include <iostream>


using std::cin;
using std::cout;
using std::endl;

int main(void)
{
    int arr[10] = {0, 1, 2, 3, 4, 5, 6, 7, 8, 9};
    int *ptr = arr;

    cout << "整个数组占用的内存空间为：" << sizeof(arr) << "字节" << endl;
    cout << "每个元素占用的内存空间为：" << sizeof(arr[0]) << "字节" << endl;
    cout << "数组元素的个数为：" << sizeof(arr) / sizeof(arr[0]) << endl;
    cout << "指针变量ptr占用的内存空间为：" << sizeof(ptr) << "字节" << endl;
    cout << "数组首地址为：" << arr << endl;

    const int i = 0;
    // int* j = &i; // 错误：不能将const int*转换为int*
    int* j = const_cast<int*>(&i); // 正确：使用const_cast去掉const属性


    return 0;
    }
