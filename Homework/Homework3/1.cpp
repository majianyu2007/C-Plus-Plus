/*
1.  编写函数，将两个有序整型序列合并成一个新的有序序列。例如，merge([1, 3, 15], [2, 4, 8, 17])，合并结果为[1, 2, 3, 4, 8, 15, 17]。函数原型为void merge(int *list1, int size1, int *list2, int size2, int *&result, int &size3)。
*/
#include <algorithm>
#include <iostream>

using std::cout;
using std::endl;


void merge(int *list1, int size1, int *list2, int size2, int *&result, int &size3)
{
    size3 = size1 + size2;
    result = new int[size3];
    std::merge(list1, list1 + size1, list2, list2 + size2, result);
}
int main(void)
{
    int list1[] = {1, 3, 15};
    int list2[] = {2, 4, 8, 17};
    int *result = nullptr;
    int size3 = 0;

    merge(list1, 3, list2, 4, result, size3);

    cout << "Merged result: [";
    for (int i = 0; i < size3; ++i)
    {
        if (i > 0)
        {
            cout << ", ";
        }
        cout << result[i];
    }
    cout << "]" << endl;

    delete[] result;

    return 0;
}